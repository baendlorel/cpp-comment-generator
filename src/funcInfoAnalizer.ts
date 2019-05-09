import { Configuration } from './configuration';

const UNIQUE_WORD = "OGIENVZEKQKSFOIGTWE";

export function GenerateFuncComment(seletedText: string,padLeftSpaceCnt:number= 0) {

    // Interpret detailed info of the function 
    var f = GetFuncInfo(seletedText);
    if (f.Modif.includes ("static")) {
        f.StaticStr = "[static]";
    }

    var padLeftSpace = "".padEnd(padLeftSpaceCnt," ");


    // Comment text
    var cmtxt = padLeftSpace + "/**\n";  
    
    // The case of a function doesn't came from a class.
    if (f.ClassName != "") {
        cmtxt += padLeftSpace + " *" + ConditionalSpace(f.StaticStr) + f.StaticStr + " " + f.ClassName + " \n";        
    }

    // Add an empty line for YOU to enter your own descriptions
    cmtxt += padLeftSpace + " * \n";

    // Parameters & Return infos
    var pnr = new Array();

    // Put parameters' info into comment text
    f.Param.forEach((elem) => {
        // Determine show {const int &} or just {int}
        // two spaces after @param to align to @return
        if (Configuration.ShowParamType) {
            if (Configuration.CompleteParamType) {
                pnr.push(" * @param  {" + elem.Const + ConditionalSpace(elem.Const) + elem.Type + elem.Pointer + ConditionalSpace(elem.Ref) + elem.Ref + ConditionalSpace(elem.Bracket) + elem.Bracket + "} " + elem.Name); 
            } else {
                pnr.push(" * @param  {"+ elem.Type + elem.Pointer + ConditionalSpace(elem.Bracket) + elem.Bracket + "} " + elem.Name); 
            }
        } else {
            pnr.push(    " * @param  " + elem.Name); 
        } 
    });

    // Don't need @return if we have got a 'void'
    if (f.ReturnType != "void" && f.ReturnType != "") {        
        pnr.push(        " * @return {" + f.ReturnType + "} ");
    }

    // Padding the param and return comments with space
    var maxlen = 0;
    pnr.forEach((elem) => {
        if (elem.length > maxlen)
            maxlen = elem.length;
    });
    maxlen++;
    pnr.forEach((elem) => {         
        cmtxt += padLeftSpace + elem.padEnd(maxlen, " ") + ": \n";
    });


    // Comment end 
    cmtxt += padLeftSpace + " */";

    return cmtxt;
}   
    
/**
 * Use the given text to get detailed function info
 * @param  {string} seletedText given text, including the whole declaration
 */
function GetFuncInfo(seletedText: string) {
    
    // Const of modifiers. May be not all of them(mail me if I lost any)
    const ModifierBeforeFuncName = ["public","private","protected","template","virtual","inline","static","extern","explicit","friend","constexpr"];
    const ModifierAfterFuncName = ["=0","=default","=delete","const","volatile","&","&&","override","final","noexcept","throw"];
    const Macros = Configuration.Macros;

    var rawParam = new Array();
    var funcInfo = new FuncInfo();  

    // Shrink consecutive spaces into one, and delete \n
    var raw = seletedText.replace(/\s+/g, " ").replace(/\n/g, "");    
    // Shink (*fptr)  () to (*fptr)()
    var raw = seletedText.replace(/\)\s+\(/g, ")(");

    var funcIdx = DetectFunction(raw);

    // Split the function string by parenthesis
    // Left part, including modifiers, function name, class name and return type
    var rawl = raw.substring(funcIdx.Start, funcIdx.ParamStart);
    
    // Middle part, including only parameters
    var rawm = raw.substring(funcIdx.ParamStart + 1, funcIdx.End);  
    rawm = rawm.replace(/\*/g, "* "); // solution for param like (int  *a)

    // Raw param might be like [""], it is not an empty array
    rawParam = rawm.split(",");
    if (rawParam.length == 1 && rawParam[0] == "") {
        rawParam = [];
    }

    // Right part, including only modifiers
    var rawr = raw.substring(funcIdx.End + 1, raw.length);  

    // Add one space to the 2 sides of our function string, to make the search handy
    rawl = " " + rawl.trim() + " ";
    rawr = " " + rawr.trim() + " ";
    
    // Deal with modifiers before function. Deleting them when it's done
    ModifierBeforeFuncName.forEach(elem => {
        var temp = " " + elem + " ";
        if (rawl.includes(temp)) { 
            switch (elem) {
                case "inline": funcInfo.Modif.push("inline"); break;
                case "static": funcInfo.Modif.push("static"); break;
                case "extern": funcInfo.Modif.push("extern"); break;
                case "vitual": funcInfo.Modif.push("vitual"); break;
                case "friend": funcInfo.Modif.push("friend"); break;
            }
            rawl = rawl.replace(temp, " ");
        }
    });

    // Deal with modifiers after function. Deleting them when it's done
    ModifierAfterFuncName.forEach(elem => {
        var temp = " " + elem + " ";
        if (rawr.includes(temp)) { 
            switch (elem) {
                case "=0": funcInfo.Modif.push("=0"); break;
                case "=default": funcInfo.Modif.push("=default"); break;
                case "=delete": funcInfo.Modif.push("=delete"); break;
            }
            rawr = rawr.replace(temp, " ");
        }
    });

    // Delete Macros defined in package.json. (What a useless feature)
    Macros.forEach(elem => {
        var temp = " " + elem + " ";
        rawl = rawl.replace(temp, " ");
        rawr = rawr.replace(temp, " ");
    });

    // For now, each variable only have:
    // rawl : return type, class name, function name
    // rawm : parameters
    // rawr : nothing

    // Reunion the seperated '*'s and align them to the left
    rawl = rawl.replace(/\s+\*/g, "*");

    rawParam.forEach(elem => {
        elem = elem.replace(/\s+\*/g, "*");
        funcInfo.Param.push(GetParaInfo(elem));
    });

    // Only have a funcname but no return type, indecating its a constructor or destructor
    if (rawl.trim().indexOf(" ") == -1) {
        funcInfo.ClassName = rawl.trim();
        funcInfo.Name = rawl.trim();
        funcInfo.ReturnType = "";
        return funcInfo;
    }

    // Use GetParaInfo function to interpret function info. Very handy
    var borrowedResult = GetParaInfo(rawl);

    // The case of no return type (useless but do not delete them)
    if (borrowedResult.Type == "void") {
        funcInfo.ReturnType = "void";
    } else {
        funcInfo.ReturnType = borrowedResult.Type + borrowedResult.Pointer;        
    }

    // Collect funcInfo 
    if (borrowedResult.Name.indexOf("::") != -1) {
        [funcInfo.ClassName,funcInfo.Name] = borrowedResult.Name.split("::");
    } else {
        funcInfo.ClassName = "";
        funcInfo.Name = borrowedResult.Name;
    }

    return funcInfo;
}


function DetectFunction(raw:string) {
    var start = 0;
    var paramStart = 0;
    var end = 0;
    var indicator = 0;

    end = FindIndex(raw, ")", "right");
    
    // Find the last '()' for it definately has parameters in it
    for (let i = 0; i < raw.length; i++) {
        if (raw[i] == "(") {
            if (indicator == 0) {
                paramStart = i;
            }
            indicator++;
        } else if (raw[i] == ")"){
            indicator--;
        }        
    }

    // Return a json, so handy
    return {
        "Start": start,
        "ParamStart": paramStart,
        "End":end
    }
}

function GetParaInfo(str: string) { 
    // & and var[] cannot exist at the same time
    var res = new ParaInfo();
    
    // Shrink multiple spaces into one
    str = str.trim().replace(/\s+/g, " ");


    //!!! Deal with function pointers
    // We assume it was a simple situation: e.g. int (*fptr)()
    var funcPtrs = DetectFunctionPointer(str);
    
    // If function pointers are detected
    if (funcPtrs.length > 0){
        // Turn function pointers to other unique words that are easy to identify
        /*for (let k = 0; k < funcPtrs.length; k++) {
            str = str.replace(funcPtrs[k], UNIQUE_WORD + k);            
        }*/
        var fptr = funcPtrs[0].replace(/\s+/g, "");
        var temp = fptr.match(/\(\*[^\)]+\)/);
        res.Name = temp[0].substring(2, temp[0].length-1);
        res.Type = str.replace(/\s+/g, "").replace(res.Name,"");

        return res;
    }
    
    
    // Bracket
    if (str.search(/\[.+\]/g) != -1) {
        res.Bracket = "[" + FindTextFrom(str, str.search(/\[.+\]/g), "]").trim() + "]";
        str = str.replace(/\[.+\]/g, "");
    } else if(str.search(/\[\]/g) != -1){
        res.Bracket = "[]";        
        str = str.replace("[]","").trim();
    } 
    
    // Align brackets to the left
    str = str.replace(/\s\[/g, "[");

    // Bracket
    if (str.indexOf("[]")==str.length-2) {
        res.Bracket = "[]";        
        str = str.replace("[]","").trim();
    }
    
    // Const
    if (str.indexOf("const") == 0) {
        res.Const = "const";
        str = str.replace("const","").trim();
    }

    // Ref
    if (str.indexOf("&") != -1) {
        res.Ref = "&";        
        str = str.replace("&","").trim();
    }
    
    // Pointer
    var idx = str.indexOf("*");
    if (idx != -1) {
        while (idx<str.length) {
            if (str[idx] == "*") { 
                res.Pointer+="*";
            }
            idx++;
        }
    }

    str = str.replace(/\*+/g, "").replace(/\s+/g, " ");


    // Type and Name
    [res.Type, res.Name] = str.split(" ");



    //!!! Turn the changed function pointers back
    for (let k = 0; k < funcPtrs.length; k++) {
        res.Name = res.Name.replace(UNIQUE_WORD + k, funcPtrs[k].replace(/\*/g," * ").replace(/\s+\*\s+/g,"*"));
        res.Type = res.Type.replace(UNIQUE_WORD + k, funcPtrs[k].replace(/\*/g," * ").replace(/\s+\*\s+/g,"*"));
    }

    return res;
        
}

function DetectFunctionPointer(str:string) {
    var res = new Array();
    var tempStr = "";
    var indicator = 0;
    var indicatorCnt = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == "(") {
            indicator++;
        } else if (str[i] == ")") {
            indicator--;
            if (indicator == 0) {
                indicatorCnt++;
            }
        }
        if (indicator > 0 || str[i] == ")") {
            tempStr += str[i];            
        }
        if (indicatorCnt == 2) {
            indicatorCnt = 0;
            res.push(tempStr);
            tempStr = "";
        }

    }
    return res;
}

function ConditionalSpace(str:string) {
    return str == "" ? "" : " "; 
}

function FindIndex(str: string, char: string, direction: string = "left") {
    if (direction.toLowerCase() == "left") {
        for (let i = 0; i < str.length; i++) {
            if (str[i] == char) {
                return i;
            }            
        }
    } else if (direction.toLowerCase() == "right"){
        for (let i = str.length - 1; i >= 0; i++) {
            if (str[i] == char) {
                return i;
            }            
        }
    }
    return -1;
}

/**
 * Find text from the given index and stop at a specific char.  
 * Finding EXCLUDES the char of index
 * @param  {string} str source string
 * @param  {number} idx start from this index
 * @param  {string} end end character, result EXCLUDEs it
 * @param  {boolean} forward default=true
 */
function FindTextFrom(str: string, idx: number, end: string, forward: boolean = true) {
    var res = "";
    if (forward) {
        idx++;
        while (idx < str.length) {
            if (str[idx] != end) {
                res = res.concat(str[idx]);
            } else {
                return res;
            }
            idx++;
        }
    } else {
        idx--;
        while (idx >= 0) {
            if (str[idx] != end) {
                res = str[idx].concat(res);
            } else {
                return res;
            }
            idx--;
        }
    }
    return res;

}


class FuncInfo{
    Param = new Array();
    Modif = new Array();
    ClassName:string = "";
    Name:string = "";
    ReturnType:string = "";
    Viability:string = "";
    StaticStr: string = "";
    InlineStr: string = "";
}

class ParaInfo { 
    Name:string = "";
    Type: string = "";
    Pointer: string = "";
    Ref: string = "";
    Const: string = "";
    Bracket: string = "";    
    log() { 
        console.log("Name = " + this.Name);
        console.log("Type = " + this.Type);
        console.log("Pointer = " + this.Pointer);
        console.log("Ref = " + this.Ref);
        console.log("Const = "+this.Const);
        console.log("Bracket = "+this.Bracket);
    }
}