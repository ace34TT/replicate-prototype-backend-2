export interface SDXLPayload {
  prompt: string;
  height: number;
  width: number;
  num_outputs: number;
  image?: string;
  prompt_strength?: number;
  num_inference_steps?: number;
}
