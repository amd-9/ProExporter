import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";

const Preview = () => {
    useEffect(() => {
        SDK.init();
    },[])

    return  <h1>Some preview here</h1>
};


ReactDOM.render(<Preview />, document.getElementById("panel-export-preview"));
