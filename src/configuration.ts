import { workspace, Uri } from "vscode";

const ExtensionTopLevelSection = "cppComment";

export class Configuration {
    static get CompleteParamType(): boolean {
        var res = this._getForWindow<boolean>("CompleteParamType");
        if (res != undefined)
            return res;
        return false; 
    }

    static get ShowParamType(): boolean {
        var res = this._getForWindow<boolean>("ShowParamType");
        if (res != undefined)
            return res;
        return false; 
    }

    static get Macros(){
        var res = this._getForWindow<Array<string>>("Macros");
        if (res == undefined)
            return [];
        return res; 
    }

    private static _getForWindow<T>(section: string): T|undefined  {
        return workspace.getConfiguration(ExtensionTopLevelSection).get<T>(section);
    }
}
