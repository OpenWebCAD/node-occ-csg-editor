const WidgetBaseBase = require("./widget_base").WidgetBaseBase;
const WidgetBase = require("./widget_base").WidgetBase;
const assert = require("assert");

class WidgetBaseConn extends WidgetBaseBase
{
    constructor(parent) {
        super();
        assert(!parent || parent instanceof WidgetBase, "expecting a WidgetBase");
        this._parent= parent;
    }
}
exports.WidgetBaseConn = WidgetBaseConn;
