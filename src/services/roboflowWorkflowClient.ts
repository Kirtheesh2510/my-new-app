/**
 * Roboflow Workflow Client for "Room Occupancy Monitor"
 * Workspace: santhosh-skandha-s-workspace
 * Workflow ID: room-occupancy-monitor
 * 
 * Complies with Roboflow Workflows Serverless API specifications:
 * - Header-based authentication: `Authorization: Bearer <API_KEY>`
 * - Declared inputs: image (url | base64)
 * - Declared parameters: confidence, iou_threshold, class_agnostic_nms, max_detections
 * - Exponential backoff retry logic & abort timeout
 * - Defensive response parsing without hardcoded assumptions
 */

export interface RoboflowWorkflowParameters {
  confidence?: number;
  iou_threshold?: number;
  class_agnostic_nms?: boolean;
  max_detections?: number;
}

export type RoboflowImageInput = 
  | { type: 'url'; value: string }
  | { type: 'base64'; value: string };

export interface RoboflowDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  className: string;
}

export interface RoboflowOccupancyResult {
  rawOutputs: Record<string, unknown>;
  occupancyCount: number;
  averageConfidence: number;
  detections: RoboflowDetection[];
  annotatedImageBase64?: string;
  executionTimeMs?: number;
}

export class RoboflowError extends Error {
  constructor(message: string, public statusCode?: number, public details?: unknown) {
    super(message);
    this.name = 'RoboflowError';
  }
}

export class RoboflowAuthError extends RoboflowError {
  constructor(message = 'Unauthorized: Invalid or missing Roboflow API key') {
    super(message, 401);
    this.name = 'RoboflowAuthError';
  }
}

export class RoboflowTimeoutError extends RoboflowError {
  constructor(message = 'Roboflow inference request timed out') {
    super(message, 408);
    this.name = 'RoboflowTimeoutError';
  }
}

export class RoboflowRateLimitError extends RoboflowError {
  constructor(message = 'Roboflow rate limit exceeded (429)') {
    super(message, 429);
    this.name = 'RoboflowRateLimitError';
  }
}

export interface ClientConfig {
  apiKey?: string;
  endpointUrl?: string;
  workspace?: string;
  workflow?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export const DEFAULT_WORKSPACE = 'santhosh-skandha-s-workspace';
export const DEFAULT_WORKFLOW = 'room-occupancy-monitor';

/**
 * Returns the appropriate endpoint URL:
 * - In the browser: uses the Vite local proxy (/api/roboflow/...) to prevent CORS 405 Method Not Allowed preflights
 * - In Node.js: uses the direct serverless URL (https://serverless.roboflow.com/...)
 */
export function getWorkflowEndpoint(
  workspace = DEFAULT_WORKSPACE,
  workflow = DEFAULT_WORKFLOW
): string {
  if (typeof window !== 'undefined') {
    return `/api/roboflow/${workspace}/workflows/${workflow}`;
  }
  return `https://serverless.roboflow.com/${workspace}/workflows/${workflow}`;
}


/**
 * Resolves the API key safely from environment (Vite frontend or Node environment)
 */
export function getRoboflowApiKey(): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ROBOFLOW_API_KEY) {
    return import.meta.env.VITE_ROBOFLOW_API_KEY;
  }
  const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  if (proc?.env?.ROBOFLOW_API_KEY) {
    return proc.env.ROBOFLOW_API_KEY;
  }
  return undefined;
}

/**
 * Defensive parser that extracts human occupancy and bounding boxes from whatever
 * output keys the workflow definition outputs (e.g. predictions, detections, count, etc.)
 */
function parseWorkflowOutputDefensively(outputObj: Record<string, unknown>): RoboflowOccupancyResult {
  let detections: RoboflowDetection[] = [];
  let occupancyCount = 0;
  let annotatedImageBase64: string | undefined;

  // 1. Scan all fields for detection arrays or person predictions
  for (const [key, value] of Object.entries(outputObj)) {
    // Check for array of predictions / detections
    if (Array.isArray(value)) {
      const parsedList: RoboflowDetection[] = [];
      for (const item of value) {
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          // Check for bounding box coordinates
          const hasCoords = ('x' in obj || 'bbox' in obj || 'box' in obj || 'x_min' in obj);
          const conf = Number(obj.confidence ?? obj.score ?? 1.0);
          const cls = String(obj.class ?? obj.className ?? obj.label ?? 'person');

          if (hasCoords || obj.class || obj.confidence) {
            parsedList.push({
              x: Number(obj.x ?? obj.x_min ?? 0),
              y: Number(obj.y ?? obj.y_min ?? 0),
              width: Number(obj.width ?? (obj.x_max ? Number(obj.x_max) - Number(obj.x_min) : 0)),
              height: Number(obj.height ?? (obj.y_max ? Number(obj.y_max) - Number(obj.y_min) : 0)),
              confidence: conf,
              className: cls
            });
          }
        }
      }
      if (parsedList.length > 0) {
        detections = parsedList;
      }
    }

    // Check for direct numeric count field (e.g. count, count_people, occupancy)
    if (typeof value === 'number' && /count|occupancy|total/i.test(key)) {
      occupancyCount = value;
    }

    // Check for annotated image output
    if (typeof value === 'string' && (value.startsWith('data:image') || value.length > 1000) && /image|visual|render/i.test(key)) {
      annotatedImageBase64 = value;
    }
  }

  // If occupancy count wasn't explicit, infer from detected person count
  if (occupancyCount === 0 && detections.length > 0) {
    occupancyCount = detections.length;
  }

  const avgConfidence = detections.length > 0
    ? Number((detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length).toFixed(2))
    : 1.0;

  return {
    rawOutputs: outputObj,
    occupancyCount,
    averageConfidence: avgConfidence,
    detections,
    annotatedImageBase64
  };
}

/**
 * Runs the Roboflow Room Occupancy Monitor workflow on a single image.
 * Includes timeout handling and exponential backoff retry.
 */
export async function runRoomOccupancyWorkflow(
  imageInput: RoboflowImageInput,
  parameters: RoboflowWorkflowParameters = {},
  config: ClientConfig = {}
): Promise<RoboflowOccupancyResult> {
  const apiKey = config.apiKey || getRoboflowApiKey();
  if (!apiKey) {
    throw new RoboflowAuthError(
      'ROBOFLOW_API_KEY is not configured. Set VITE_ROBOFLOW_API_KEY in .env or provide it via client config.'
    );
  }

  const endpoint = config.endpointUrl || getWorkflowEndpoint(config.workspace, config.workflow);
  const timeoutMs = config.timeoutMs ?? 15000;
  const maxRetries = config.maxRetries ?? 2;

  // Prepare payload according to Roboflow Workflows Serverless specification
  const sanitizedImage = imageInput.type === 'base64'
    ? { type: 'base64', value: imageInput.value.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '') }
    : imageInput;

  const payload: Record<string, unknown> = {
    inputs: {
      image: sanitizedImage
    }
  };

  // Attach declared parameters if provided
  const declaredParams: Record<string, unknown> = {};
  if (parameters.confidence !== undefined) declaredParams.confidence = parameters.confidence;
  if (parameters.iou_threshold !== undefined) declaredParams.iou_threshold = parameters.iou_threshold;
  if (parameters.class_agnostic_nms !== undefined) declaredParams.class_agnostic_nms = parameters.class_agnostic_nms;
  if (parameters.max_detections !== undefined) declaredParams.max_detections = parameters.max_detections;

  if (Object.keys(declaredParams).length > 0) {
    payload.parameters = declaredParams;
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const startTime = Date.now();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutTimer);

      if (response.status === 401 || response.status === 403) {
        throw new RoboflowAuthError(`Roboflow authentication failed (${response.status}). Check your API key.`);
      }

      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
          attempt++;
          continue;
        }
        throw new RoboflowRateLimitError();
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new RoboflowError(
          `Roboflow server error (${response.status}): ${errorText}`,
          response.status,
          errorText
        );
      }

      const data = await response.json();
      const executionTimeMs = Date.now() - startTime;

      // Result is an array of outputs or an object with `outputs` array
      let rawResultObject: Record<string, unknown> = {};
      if (Array.isArray(data)) {
        rawResultObject = data[0] || {};
      } else if (Array.isArray(data.outputs)) {
        rawResultObject = data.outputs[0] || {};
      } else if (data.outputs && typeof data.outputs === 'object') {
        rawResultObject = data.outputs;
      } else {
        rawResultObject = data;
      }

      const parsed = parseWorkflowOutputDefensively(rawResultObject);
      parsed.executionTimeMs = executionTimeMs;

      return parsed;

    } catch (err: any) {
      clearTimeout(timeoutTimer);

      if (err.name === 'AbortError') {
        lastError = new RoboflowTimeoutError(`Request timed out after ${timeoutMs}ms (attempt ${attempt + 1})`);
      } else if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
        lastError = new RoboflowError(
          `Failed to reach Roboflow server (${endpoint}). In the browser, this occurs if the Vite dev proxy is reloading or if internet connectivity to Roboflow is interrupted.`,
          0,
          err
        );
      } else {
        lastError = err;
      }

      // If it's an Auth error, retrying won't help
      if (err instanceof RoboflowAuthError) {
        throw err;
      }

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 600;
        await new Promise(r => setTimeout(r, backoffMs));
        attempt++;
      } else {
        break;
      }
    }
  }

  throw lastError || new RoboflowError('Failed to execute Roboflow workflow after retries.');
}
