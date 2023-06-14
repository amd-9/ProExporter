import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, getClient, IHostPageLayoutService, IProjectPageService, IProjectInfo } from "azure-devops-extension-api";
import { TestPlanRestClient, TestPlan } from "azure-devops-extension-api/TestPlan";

SDK.register("export-test-data", () => {
    return {
        execute: async (context: any) => {

            // const { project } = context

            // const result = await getClient(TestPlanRestClient).getTestPlanById()
            
            // getDefinition(context.project.id, context.id, undefined, undefined, undefined, true);

            const dialogSvc = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
            const projectSvc = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);

            const currentProject: IProjectInfo | undefined = await projectSvc.getProject();

            if (!currentProject) {
                dialogSvc.openMessageDialog("Unable to determine current project" , { showCancel: false });
                return;
            }

            const testPlan: TestPlan = await getClient(TestPlanRestClient).getTestPlanById(currentProject.id, context.plan.id);
 
            dialogSvc.openMessageDialog(`Current context is ${JSON.stringify(context)} plan data is ${JSON.stringify(testPlan)}` , { showCancel: false });
        }
    }
});

SDK.init();