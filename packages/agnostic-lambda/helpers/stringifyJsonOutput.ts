import { AgnosticOutput, AgnosticOutputJson } from '../event';

export const stringifyJsonOutput = (jsonOutput: AgnosticOutputJson<any>): AgnosticOutput => {
  const json = jsonOutput.json;
  const newOutput = { ...jsonOutput } as Partial<AgnosticOutputJson>;
  delete newOutput.json;
  (newOutput as AgnosticOutput).body = JSON.stringify(json);
  return newOutput as AgnosticOutput;
};
