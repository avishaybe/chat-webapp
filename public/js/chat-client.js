class HTMLConsoleAppender{
    constructor(){

    }
    append(level, logFunction, logMsg) {
        var logFunc =  console[logFunction] || console.log;
        if(logFunc)
            logFunc.call(console, logMsg);
    }
};

class HTMLLogger{
    constructor(category){
        this._threshold = 0; //WARN
        this._appenderList = [];
        this._category = category;
   
        this._appenderList = [];
        this._addAppender(new HTMLConsoleAppender());
    }

    trace(msg) {
        this._log(10000, "log", msg);
    }
    prettyTrace(msg) {
        this._log(10000, "log", msg);
    }
    debug(msg) {
        this._log(20000, "log", msg);
    }
    prettyDebug(msg) {
        this._log(20000, "log", msg);
    }
    info(msg) {
        this._log(30000, "info", msg);
    }
    warn(msg) {
        this._log(40000, "warn", msg);
    }
    error(msg) {
        this._log(50000, "error", msg);
    }
    fatal(msg) {
        this._log(60000, "error", msg);
    }
    _addAppender(appender) {
        if (!appender)
            return;

        this._appenderList.push(appender);
    }
    _log(level, logFunction, logMsg) {
        if (level < this._threshold)
            return;

        this._appenderList.forEach(function (appender) {
            appender.append(level, logFunction, logMsg);
        });
    }
};

class ChatController{
    constructor(){
        this._logger = new HTMLLogger("ChatController");
        this._logger.info(": Started");
        this.setControlsDisableState(true);
        this.connectToEvents();
        this.onLoaded();
    }

    connectToEvents(){
        let selectControl = document.getElementById("availableGroups");
        selectControl.addEventListener("change",() => this.onEnterGroup(), false);
    }

    setControlsDisableState(disableState){
        this._logger.trace("setControlsDisableState: Going to set the control state to " + (disableState ? "disable":"enabled"));
        let controlsToChaneNames = ["sendBtn","sendBtn","message","availableGroups"];
        controlsToChaneNames.forEach((elementName) => {
            let control = document.querySelector("#" + elementName);
            control.disabled = disableState;
        });
    }

    onEnterGroup(){
        this._logger.info("onEnterGroup(){: Started");
        let availableGroups = document.getElementById("availableGroups").options;
        let selectedGroup = Array.prototype.filter.call(availableGroups,(option) => option.selected)[0];
        this._logger.info("onEnterGroup: Going to enter the group with id:" + selectedGroup.value);
        let request = new XMLHttpRequest();  
        request.open('POST', 'http://localhost:8080/rest/chatmanager/enterRoom',true);  
        request.onreadystatechange = () => {
            if (request.readyState == 4 && request.status == 200) {
                this._logger.trace("onEnterGroup: Got the following response" + request.responseText);
                this.currentGroup = selectedGroup.value;
            }
        }
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify({
            userId: document.querySelector("#userId").value,
            groupId: selectedGroup.value,
            currentGroup: this.currentGroup
        }));
    }

    onListOfGrupsArrived(groupsDetails){
        this._logger.trace("onListOfGrupsArrived: Got the following groupData="+JSON.stringify(groupsDetails,null,2));

        //Clears the current list.
        let selectControl = document.getElementById("availableGroups");
        selectControl.innerHTML = "";
        Object.keys(groupsDetails).forEach((groupId) =>{
            let option = document.createElement("option");
            option.innerText = groupsDetails[groupId];
            option.value = groupId;
            selectControl.appendChild(option);
        });
        this.setControlsDisableState(false);
    }
    
    onLoaded(){
        this._logger.info("onLoaded: Started");
        //send the request for available groups.
        let request = new XMLHttpRequest();  
        request.open('GET', 'http://localhost:8080/rest/chatmanager/getAllGroups',true);  
        request.onreadystatechange = () => {
            if (request.readyState == 4 && request.status == 200) {
                this._logger.trace("onLoaded: Got the following response" + request.responseText);
                let groupsData = JSON.parse(request.responseText);
                this.onListOfGrupsArrived(groupsData);
            }
            
        }
        request.send();
    }
};

window.chatController = new ChatController();