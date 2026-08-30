import type {
  EngineAction,
  JsonObject,
  JsonValue,
  ParameterType,
  ParameterValues,
  SimulationEngineOptions,
  SimulationState,
  StepContext,
  ValidatedSimulationSpec,
} from "./types.js";

/**
 * Framework-independent state holder for a validated SimulationSpec.
 *
 * It deliberately owns no rendering, scheduling, or domain-specific behavior.
 */
export class SimulationEngine {
  readonly #initialParameters: Record<string, JsonValue>;
  readonly #initialState: SimulationState;
  readonly #onStep?: SimulationEngineOptions["onStep"];
  readonly #parameterTypes: Record<string, ParameterType>;

  #parameters: Record<string, JsonValue>;
  #state: SimulationState;

  constructor(spec: ValidatedSimulationSpec, options: SimulationEngineOptions = {}) {
    this.#initialState = clone(spec.initialState);
    this.#state = clone(spec.initialState);
    this.#initialParameters = parametersFrom(spec);
    this.#parameterTypes = parameterTypesFrom(spec);
    this.#parameters = clone(this.#initialParameters);
    this.#onStep = options.onStep;
  }

  /** Returns a snapshot so callers cannot mutate engine-owned state. */
  getState(): SimulationState {
    return clone(this.#state);
  }

  /** Returns the current parameter values, kept separate from simulation state. */
  getParameters(): ParameterValues {
    return clone(this.#parameters);
  }

  dispatch(action: EngineAction): void {
    switch (action.type) {
      case "reset":
        this.#state = clone(this.#initialState);
        this.#parameters = clone(this.#initialParameters);
        return;
      case "set_parameter":
        this.#setParameter(action.target, action.parameters);
        return;
      case "step":
        this.#step();
    }
  }

  #setParameter(target: string | undefined, parameters: JsonObject | undefined): void {
    if (target === undefined || parameters === undefined || !("value" in parameters)) {
      throw new Error("set_parameter requires a target and parameters.value");
    }

    if (!(target in this.#parameters)) {
      throw new Error(`Unknown simulation parameter: ${target}`);
    }

    const value = parameters.value;
    if (!matchesParameterType(value, this.#parameterTypes[target])) {
      throw new Error(`Invalid value for simulation parameter: ${target}`);
    }

    this.#parameters[target] = clone(value);
  }

  #step(): void {
    if (this.#onStep === undefined) {
      return;
    }

    const context: StepContext = {
      state: this.getState(),
      parameters: this.getParameters(),
    };
    const nextState = this.#onStep(context);

    if (nextState !== undefined) {
      this.#state = clone(nextState);
    }
  }
}

function parametersFrom(spec: ValidatedSimulationSpec): Record<string, JsonValue> {
  return Object.fromEntries(spec.parameters.map((parameter) => [parameter.name, parameter.value]));
}

function parameterTypesFrom(spec: ValidatedSimulationSpec): Record<string, ParameterType> {
  return Object.fromEntries(spec.parameters.map((parameter) => [parameter.name, parameter.type]));
}

function matchesParameterType(value: JsonValue, type: ParameterType): boolean {
  switch (type) {
    case "array":
      return Array.isArray(value);
    case "boolean":
    case "number":
    case "string":
      return typeof value === type;
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
