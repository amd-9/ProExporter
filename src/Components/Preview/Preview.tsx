import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { Button } from "azure-devops-ui/Button";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { Table, renderSimpleCell, TableColumnLayout, ISimpleTableCell } from "azure-devops-ui/Table";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { TestPlanRestClient, TestSuite, TestCase } from "azure-devops-extension-api/TestPlan";
import { PagedList } from "azure-devops-extension-api/WebApi/WebApi";
import { xml2js } from 'xml-js';
import { getClient } from "azure-devops-extension-api";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import "azure-devops-ui/Core/override.css";

enum PreviewState {
    SDKInit,
    Loading,
    Loaded,
    Error,
}

interface ITestCaseStepItem extends ISimpleTableCell {
    number: number;
    action: string;
    expectedResult: string;
}

const tableData = new ArrayItemProvider<ITestCaseStepItem>([]);

const columns = [
    {
        columnLayout: TableColumnLayout.singleLinePrefix,
        id: "number",
        name: "number",
        readonly: true,
        renderCell: renderSimpleCell,
        width: new ObservableValue(-30),
    },
    {
        id: "action",
        name: "action",
        readonly: true,
        renderCell: renderSimpleCell,
        width: new ObservableValue(-30),
    },
    {
        id: "expectedResult",
        name: "expectedResult",
        readonly: true,
        renderCell: renderSimpleCell,
        width: new ObservableValue(-30),
    },
]


const Preview = () => {
    const [state, setState] = useState<PreviewState>(PreviewState.SDKInit);
    const [config, setConfig] = useState<any>();
    const [suitesData, setSuitesData] = useState<any[]>();
    
    useEffect(() => {
        SDK.init().then(() => {
            setConfig(SDK.getConfiguration());
            setState(PreviewState.Loading);
        });
    },[])

    useEffect(() => {
        if (state === PreviewState.Loading) {
            (async () => {
                await getTestData();
                setState(PreviewState.Loaded)
                SDK.resize(750, 720);
            })();            
        }
    }, [state])

    const handleClose = () => {
        config.dialog.close();
    };

    const showConfig = () => {
        console.log('Config', config);
    };

    const getTestData = async () => {
        const { currentProject, context} = config;
  
        const testPlanClient = getClient(TestPlanRestClient);
        const testSuites : PagedList<TestSuite> = await testPlanClient.getTestSuitesForPlan(currentProject.id, context.plan.id);

        let suitesData: any[] = [];           

        for (let suite of testSuites) {
            const suiteTestCases: PagedList<TestCase> = await testPlanClient.getTestCaseList(currentProject.id, context.plan.id, suite.id);

            const casesWithSteps = suiteTestCases.reduce((acc, { workItem }) => {
                const { name, workItemFields } = workItem;
                const stepsField = workItemFields.find(field => field['Microsoft.VSTS.TCM.Steps']);  
                const { steps: { step: stepsData }} = xml2js(stepsField['Microsoft.VSTS.TCM.Steps'], { compact: true }) as any;

                const steps = stepsData.map((step: any, index: number) => {
                    const [ actionData, expectedResultData ] = step.parameterizedString;

                    return { number: index, action: actionData._text, expectedResult: expectedResultData._text };
                });

                return [ ...acc, { name, steps: steps}];
            }, [] as any []);


            suitesData = [ ...suitesData, { suiteName: suite.name, testCases: casesWithSteps}] 
        }

        setSuitesData(suitesData);
    };

    const getStepsTableItemsProvider = (steps: any) => new ArrayItemProvider<ITestCaseStepItem>(
        steps
    );

    if (state !== PreviewState.Loaded) {
        return <Spinner size={SpinnerSize.large} />
    }

    return (
        <div>
                {
                    suitesData?.map(({suiteName, testCases}) =>(
                        <> 
                        <h3>{suiteName}</h3>                        
                        { testCases.length === 0 &&  <div>No tests cases for the suite</div> }
                        { testCases.length > 0 && testCases.map((testCase: any) =>
                                <> 
                                    <h4>{testCase.name}</h4>
                                    <Table
                                        ariaLabel={`Steps for testcase: ${testCase.name}`}
                                        columns={columns}
                                        itemProvider={getStepsTableItemsProvider(testCase.steps)}
                                        role="table"
                                        className="table-example"
                                        containerClassName="h-scroll-auto"
                                    />
                                </>
                            )
                        }
                    </>
                    ))
                }
                <br />
                <ButtonGroup className="flex-wrap">
                    <Button
                        primary={true}
                        text="Save as Excel"
                        onClick={showConfig}
                    />
                    <Button
                        text="Close"
                        onClick={handleClose}
                />
               </ButtonGroup>  
  
        </div>
            );
};


ReactDOM.render(<Preview />, document.getElementById("panel-export-preview"));
