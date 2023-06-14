import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, getClient, IHostPageLayoutService, IProjectPageService, IProjectInfo } from "azure-devops-extension-api";
import { TestPlanRestClient, TestSuite, TestCase } from "azure-devops-extension-api/TestPlan";
import { PagedList } from "azure-devops-extension-api/WebApi/WebApi";
import { xml2json } from 'xml-js';


SDK.register("export-test-data", () => {
    return {
        execute: async (context: any) => {

            const dialogSvc = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
            const projectSvc = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);

            const currentProject: IProjectInfo | undefined = await projectSvc.getProject();

            if (!currentProject) {
                dialogSvc.openMessageDialog("Unable to determine current project" , { showCancel: false });
                return;
            }

            const testPlanClient = getClient(TestPlanRestClient);
            const testSuites : PagedList<TestSuite> = await testPlanClient.getTestSuitesForPlan(currentProject.id, context.plan.id);

            let suitesData: any[] = [];           

            for (let suite of testSuites) {
                const suiteTestCases: PagedList<TestCase> = await testPlanClient.getTestCaseList(currentProject.id, context.plan.id, suite.id);

                const casesWithSteps = suiteTestCases.reduce((acc, { workItem }) => {
                    const { name, workItemFields } = workItem;
                    const stepsField = workItemFields.find(field => field['Microsoft.VSTS.TCM.Steps']);
                    const stepsData = xml2json(stepsField['Microsoft.VSTS.TCM.Steps']);

                    return [ ...acc, { name, steps: stepsData}];
                }, [] as any []);


                suitesData = [ ...suitesData, { suiteName: suite.name, testCases: casesWithSteps}] 
            }

 
            dialogSvc.openMessageDialog(`${JSON.stringify(suitesData)}` , { showCancel: false });
        }
    }
});

SDK.init();