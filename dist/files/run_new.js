(function (win) {
    'use strict';
    
    document.toggle = function(modes) {
        if (typeof(modes) === 'object') {
            modes.forEach(element => {
                var m = document.getElementById(element);
                if (m != null) {
                   m.style.display = (m.style.display == 'none') ? 'flex' : 'none';
                }
            });
        }
    }
})(window);