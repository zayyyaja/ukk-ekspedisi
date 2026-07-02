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

  class CoreApi {
    constructor(config: SnapConfig);
    transaction: {
      status(transactionId: string): Promise<Record<string, unknown>>;
    };
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
