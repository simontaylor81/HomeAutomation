define(['handlebars'], function(Handlebars) {

return Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"input-group\">\r\n    <input type=\"text\" class=\"form-control\" value=\""
    + escapeExpression(((helper = (helper = helpers.initialText || (depth0 != null ? depth0.initialText : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"initialText","hash":{},"data":data}) : helper)))
    + "\">\r\n    <span class=\"input-group-btn\">\r\n        <button class=\"btn btn-default\" type=\"button\">Go</button>\r\n    </span>\r\n</div>\r\n";
},"useData":true})

});