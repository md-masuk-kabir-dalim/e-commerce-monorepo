import CircuitBreaker from "opossum";

export const breaker = (serviceCall: any) => {
  const options = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  };
  const circuit = new CircuitBreaker(serviceCall, options);
  return circuit.fire.bind(circuit);
};
