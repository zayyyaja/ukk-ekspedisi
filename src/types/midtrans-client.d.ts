declare module "midtrans-client" {
  type SnapConfig = {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  };

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: Record<string, unknown>): Promise<unknown>;
  }

  const midtransClient: {
    Snap: typeof Snap;
  };

  export default midtransClient;
}
