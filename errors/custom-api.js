export class CustomAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomAPIError";
  }
}
