// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { workspace } from "vscode";
import { instrumentOperationStep } from "vscode-extension-telemetry-wrapper";
import { IProjectMetadata } from "./IProjectMetadata";
import { IStep } from "./IStep";
import { SpecifyJavaVersionStep } from "./SpecifyJavaVersionStep";
import { createPickBox, IPickMetadata } from "./utils";

export class SpecifyPackagingStep implements IStep {

    public static getInstance(): SpecifyPackagingStep {
        return SpecifyPackagingStep.specifyPackagingStep;
    }

    private static specifyPackagingStep: SpecifyPackagingStep = new SpecifyPackagingStep();

    public getNextStep(): IStep | undefined {
        return SpecifyJavaVersionStep.getInstance();
    }

    public async execute(operationId: string, projectMetadata: IProjectMetadata): Promise<IStep | undefined> {
        if (!await instrumentOperationStep(operationId, "Packaging", this.specifyPackaging)(projectMetadata)) {
            return projectMetadata.pickSteps.pop();
        }
        return this.getNextStep();
    }

    private async specifyPackaging(projectMetadata: IProjectMetadata): Promise<boolean> {
        const packaging: string = projectMetadata.defaults.packaging || workspace.getConfiguration("spring.initializr").get<string>("defaultPackaging");
        if (packaging) {
            projectMetadata.packaging = packaging && packaging.toLowerCase();
            return true;
        }
        const pickMetaData: IPickMetadata = {
            metadata: projectMetadata,
            title: "Spring Initializr: Specify packging type",
            pickStep: SpecifyPackagingStep.getInstance(),
            placeholder: "Specify packaging type.",
            items: [{ label: "JAR" }, { label: "WAR" }]
        };
        return await createPickBox(pickMetaData);
    }
}
