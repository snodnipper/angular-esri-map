/*global require: false*/
(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriLoader
     *
     * @requires $q
     *
     * @description
     * Use `esriLoader` to lazyload the Esri ArcGIS API or to require API modules.
     */
    angular.module('esri.core').factory('esriLoader', function ($q) {

        /**
         * @ngdoc function
         * @name bootstrap
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Loads the Esri ArcGIS API for JavaScript.
         *
         * @param {Object=} options Send a list of options of how to load the Esri ArcGIS API for JavaScript.
         *  Defaults to `{url: 'http://js.arcgis.com/3.15compact'}`
         *
         * @return {Promise} Returns a $q style promise which is resolved once the ArcGIS API for JavaScript has been loaded.
         */
        function bootstrap(options) {
            var deferred = $q.defer();

            // Default options object to empty hash
            var opts = options || {};

            // Don't reload API if it is already loaded
            if (isLoaded()) {
                deferred.reject('ESRI API is already loaded.');
                return deferred.promise;
            }

            // Create Script Object to be loaded
            var script    = document.createElement('script');
            script.type   = 'text/javascript';
            script.src    = opts.url || 'http://js.arcgis.com/3.15compact';

            // Set onload callback to resolve promise
            script.onload = function() { deferred.resolve( window.require ); };

            document.body.appendChild(script);

            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name isLoaded
         * @methodOf esri.core.factory:esriLoader
         *
         * @return {Boolean} Returns a boolean if the Esri ArcGIS API for JavaScript is already loaded.
         */
        function isLoaded() {
            return typeof window.require !== 'undefined';
        }

        /**
         * @ngdoc function
         * @name require
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Load an Esri module using the Dojo AMD loader.
         *
         * @param {String|Array} modules A string of a module or an array of modules to be loaded.
         * @param {Function=} callback An optional function used to support AMD style loading, promise and callback are both added to the event loop, possible race condition.
         * @return {Promise} Returns a $q style promise which is resolved once modules are loaded
         */
        function requireModule(moduleName, callback){
            var deferred = $q.defer();

            // Throw Error if Esri is not loaded yet
            if ( !isLoaded() ) {
                deferred.reject('Trying to call esriLoader.require(), but esri API has not been loaded yet. Run esriLoader.bootstrap() if you are lazy loading esri ArcGIS API.');
                return deferred.promise;
            }
            if (typeof moduleName === 'string') {
                require([moduleName], function (module) {

                    // Check if callback exists, and execute if it does
                    if (callback && typeof callback === 'function') {
                        callback(module);
                    }
                    deferred.resolve(module);
                });
            }
            else if (moduleName instanceof Array) {
                require(moduleName, function () {

                    var args = Array.prototype.slice.call(arguments);

                    // callback check, sends modules loaded as arguments
                    if (callback && typeof callback === 'function') {
                        callback.apply(this, args);
                    }

                    // Grab all of the modules pass back from require callback and send as array to promise.
                    deferred.resolve(args);
                });
            } else {
                deferred.reject('An Array<String> or String is required to load modules.');
            }

            return deferred.promise;
        }

        // Return list of aformentioned functions
        return {
            bootstrap: bootstrap,
            isLoaded:  isLoaded,
            require:   requireModule
        };
    });

})(angular);
