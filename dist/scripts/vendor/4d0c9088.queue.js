!function(){function a(a){function d(){for(;h=k<j.length&&a>l;){var b=k++,d=j[b],f=c.call(d,1);f.push(e(b)),++l,d[0].apply(null,f)}}function e(a){return function(b,c){--l,null==n&&(null!=b?(n=b,k=m=NaN,f()):(j[a]=c,--m?h||d():f()))}}function f(){null!=n?o(n):i?o(n,j):o.apply(null,[n].concat(j))}var g,h,i,j=[],k=0,l=0,m=0,n=null,o=b;return a||(a=1/0),g={defer:function(){return n||(j.push(arguments),++m,d()),g},await:function(a){return o=a,i=!1,m||f(),g},awaitAll:function(a){return o=a,i=!0,m||f(),g}}}function b(){}var c=[].slice;a.version="1.0.7","function"==typeof define&&define.amd?define(function(){return a}):"object"==typeof module&&module.exports?module.exports=a:this.queue=a}();