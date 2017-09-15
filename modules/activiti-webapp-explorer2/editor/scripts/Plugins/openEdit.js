if (!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.OpenEdit = Clazz.extend({
	facade: undefined,

	construct: function (facade) {

		this.facade = facade;

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, this.actOnDBLClick.bind(this));
	},
	actOnDBLClick: function (evt, shape) {
		
		var func = null;
		var sc = null;
		if( !(shape instanceof ORYX.Core.Shape) ){ return; }
        alert(shape);
        if (shape.properties['oryx-beanselect'] !== undefined) {
            func = KisBpmBeanSelectCtrl[2];
            sc = this.getScope("beanselect", shape)
		} else if (shape.properties['oryx-scripttext'] !== undefined) {
			func = KisBpmTextPropertyCtrl[2];
            sc = this.getScope("scripttext", shape)
        } else if (shape.properties['oryx-conditionsequenceflow'] !== undefined) {
            func = KisBpmConditionFlowSelectCtrl[2];
            sc = this.getScope("conditionsequenceflow", shape)
		} else {
			return;
		}
		var mod = sc.getModal();
		func(sc, mod);
	},

	getScope: function (id, shape) {
		var props = shape.getStencil().properties()
		for (var i = 0; i < props.length; i++) {
			if(props[i]._jsonProp.id == id)	{
				return angular.element(document.getElementsByClassName('title ng-scope ng-binding')[i]).scope();
			}
		}
	}
})
