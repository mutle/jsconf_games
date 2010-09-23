(function($) {

  var presentation = {}, slides = [], current_slide = 0;

  function build_slide(id) {
    var slide, content, slide_info;
    $("#slides").empty();
    slide = $("#slides #slide_"+id);
    if(slide.length > 0) {
      slide.show();
    } else {
      slide = $("<div class='slide' id='slide_"+id+"' />");
      slide_info = slides[id];

      slide.append("<h1>"+presentation.title+"</h1>");
      content = $("<div class='content'>");

      if(slide_info.replace) {
        content.append("<div class='text'>"+slide_info+"</div>");
      } else {
        if(slide_info.title) {
          content.append("<div class='title'>"+slide_info.title+"</div>");
        }
        if(slide_info.iframe) {
          var extra = (slide_info.iframe_height ? " style='height: "+slide_info.iframe_height+"px;'": "");
          content.append("<iframe scrolling='no' frameborder='0' src='"+slide_info.iframe+"'"+extra+"></iframe>");
        }
        if(slide_info.text) {
          content.append("<div class='extra_text'>"+slide_info.text+"</div>");
        }
        if(slide_info.code) {
          content.append("<div class='code'><pre>"+slide_info.code+"\n</pre></div>");
        }
      }

      slide.append(content);
      slide.append("<div class='author'>"+presentation.author+"</div>");
      slide.append("<div class='index'>"+(id+1)+"/"+slides.length+"</div>");
      $("#slides").append(slide);
    }
    window.location.hash = id;
    current_slide = id;
  }

  $(document).ready(function() {
    $.getJSON("slides.json", function(data) {
      presentation = data.presentation;
      slides = data.slides;
      var first_slide = parseInt(window.location.hash.replace(/^#/, '')) || 0;
      build_slide(first_slide);
    });
  });

  $(document).keydown(function(e) {
    if(e.keyCode == 32 || e.keyCode == 39) { // Next slide
      if(current_slide + 1 < slides.length)
        build_slide(current_slide + 1);
    }
    if(e.keyCode == 37) { // Previous slide
      if(current_slide > 0)
        build_slide(current_slide - 1);
    }
  });

})(jQuery);
