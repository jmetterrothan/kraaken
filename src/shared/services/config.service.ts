class ConfigService {
  public debug: boolean;

  constructor() {
    this.debug = true;
  }
}

export const configSvc = new ConfigService();