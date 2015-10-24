(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriFeatureLayer', function($q, esriMapUtils) {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriFeatureLayer to be used as an element (<esri-feature-layer>)
            restrict: 'E',

            // require the esriFeatureLayer to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['esriFeatureLayer', '^esriMap'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // isolate scope for feature layer so it can be added/removed dynamically
            scope: {
                url: '@',
                visible: '@?',
                opacity: '@?',
                definitionExpression: '@?',
                // function binding for event handlers
                load: '&',
                updateEnd: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            controllerAs: 'layerCtrl',

            bindToController: true,

            // define an interface for working with this directive
            controller: function() {
                var layerDeferred;

                // create layer from bound controller properties
                this.createLayer = function() {

                    // get feature layer options from layer controller properties
                    var layerOptions = esriMapUtils.getFeatureLayerOptions(this);

                    // create the layer
                    layerDeferred = esriMapUtils.createFeatureLayer(this.url, layerOptions);
                    return layerDeferred.promise;
                };

                // return the deferred that will be resolved with the feature layer
                this.getLayer = function() {
                    // throw error if createLayer was not called
                    if (!layerDeferred.promise) {
                        throw Error('Layer has not yet been created. Call createLayer().');
                    }
                    return layerDeferred.promise;
                };

                this.setInfoTemplate = function(infoTemplate) {
                    this._infoTemplate = infoTemplate;
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map
            link: function(scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // create the layer and it to the map and then
                layerController.createLayer().then(function(layer){
                    // get layer info from layer and directive attributes
                    var layerInfo = esriMapUtils.getLayerInfo(layer, attrs);

                    // add the layer to the map
                    esriMapUtils.addLayerToMap(mapController, layer, 0, layerInfo);

                    // bind directive attributes to layer properties and events
                    esriMapUtils.bindLayerEvents(scope, attrs, layer, mapController);

                    // additional directive attribute binding specific to this type of layer

                    // watch the scope's definitionExpression property for changes
                    // set the definitionExpression of the feature layer
                    scope.$watch('layerCtrl.definitionExpression', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            layer.setDefinitionExpression(newVal);
                        }
                    });
                });
            }
        };
    });

})(angular);
