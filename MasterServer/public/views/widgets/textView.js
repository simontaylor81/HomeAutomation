define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += " <div class=\"input-group\">\r\n    <input type=\"text\" class=\"form-control\" value=\"";
  if (stack1 = helpers.initialText) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.initialText); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\r\n    <span class=\"input-group-btn\">\r\n        <button class=\"btn btn-default\" type=\"button\">Go</button>\r\n    </span>\r\n</div>";
  return buffer;
  })

});