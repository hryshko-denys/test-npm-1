import { ESolConfig } from './config';

export class ESol {
  constructor(public readonly config: ESolConfig = new ESolConfig()) {}
}
