const WidgetConnector = require("./widget_connector").WidgetConnector;
const assert = require("assert");

class WidgetConnectorList {

    constructor(parent) {
        this._parent = parent;
        if (this._parent) {
            this._parent._subWidgetCollection = this._parent._subWidgetCollection || [];
            this._parent._subWidgetCollection.push(this);
        }
        this._list = [];
    }


    getWidgetClass() {
        throw new Error("WidgetConnectorList#getWidgetClass must be overridden");
    }

    getWidgetConnectors(optionalBaseClass) {
        assert(!optionalBaseClass || optionalBaseClass instanceof Function);
        const results = this._list.map(item=>item.getWidgetConnectors(optionalBaseClass));
        // now flatten the results
        return [].concat.apply([],results);
    }

    add(object) {
        assert(this._parent instanceof Object);
        this._list.push(object);
    }

    setAt(index, object) {

        assert(this._parent instanceof Object);
        assert(!object || this.isValidConnectedObject(object), "WidgetConnector#set expecting a valid widget object");
        this.__removeDependantEntity();
        this._linked = object;
        this.__addDependantEntity();
    }

    getAt(index) {
        assert(!this._linked || this.isValidConnectedObject(this._linked));
        return this._linked;
    }
}
exports.WidgetConnectorList = WidgetConnectorList;
