# Cpp Comment Generator

## Brief

This extension is made to comment C++ functions in a specific format. So we can save that time for something greater.

## How To Use

##### Step 1 : Locating your function
* If your function statement is on one line, then right click on that line
* Or you can select your function from start to a place between ")" and "{"

##### Step 2 : Do the comment
* Hotkey : ctrl+alt+z
* Right click on the **C++** editor content and choose "Generate Cpp Comment"
* Turn on the command panel and enter "Generate Cpp Comment"


![](image\locating_small.gif) ![](image\2ways_small.gif)

## Features

It works like another extension named ["Add jsdoc comment"](https://marketplace.visualstudio.com/items?itemName=stevencl.addDocComments) created by stevencl. Inspired by that I made to interpret most of the common function statements. The example below is the most **complex** situation I can *(imagine and)* settle  :


    inline    static returnType *   * * & class1Name::funcName(type1  var1,
    const    type2   * * 
       var2 [  class2Name::
    var ] ) {}


and the result is 

    /**
     * [static] From classname
     * 
     * @param  {typename} var1
     * @param  {const typename*** [wer::Sd]} var2
     */
 

## Settings

cppComment.CompleteParamType =  true&nbsp;&nbsp;&nbsp;-> @param {const int &} paraName
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;= false -> @param {int} paraName

cppComment.ShowParamType =  true&nbsp;&nbsp;&nbsp;-> @param {const int &} paraName
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&thinsp;= false -> @param  paraName

## Known Issues

It only works for **C++ files**

### Ver 1.0.2

Support for function pointers. 
Fix the problem of being unable to interpret "int *var".

### Ver 1.0.1

Align comments to the function. 
Fix that "virtual" spelled as "vitual". 
Support for constructors and destructors 

### Ver 1.0.0

Initialize a version that can only serve the basic requirements. 
