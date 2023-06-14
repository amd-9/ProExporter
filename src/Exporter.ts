import * as SDK from 'azure-devops-extension-sdk';
import {
  CommonServiceIds,
  IHostPageLayoutService,
  IProjectPageService,
  IProjectInfo,
} from 'azure-devops-extension-api';

SDK.register('export-test-data', () => ({
  execute: async (context: any) => {
    const dialogSvc = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
    const projectSvc = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const currentProject: IProjectInfo | undefined = await projectSvc.getProject();

    const {
      suite: { id, name },
    } = context;

    dialogSvc.openCustomDialog(SDK.getExtensionContext().id + '.panel-export-preview', {
      title: `Export preview for TestSuite (ID: ${id}), ${name}`,
      configuration: {
        currentProject,
        context,
      },
    });
  },
}));

SDK.init();
