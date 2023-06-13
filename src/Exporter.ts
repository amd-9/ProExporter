import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IHostPageLayoutService } from "azure-devops-extension-api";

SDK.register("export-test-data", () => {
    return {
        execute: async (context: any) => {
            const dialogSvc = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
            dialogSvc.openMessageDialog(`Current context is ${JSON.stringify(context)}`, { showCancel: false });
        }
    }
});

SDK.init();