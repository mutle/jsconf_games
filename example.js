var global = this;

(function($) {
  var debug = true; // false;
  var animate = (presentation_step == 2 ? window.location.hash == "#animate" : true) && presentation_step != 5;

  function getMilliseconds() {
    d = new Date();
    return d.getTime();
  }

  var init_game = function() {
    var background, background_mask, sprite;

    if(presentation_step > 0) {
      background = new Image("room_0.gif", function() {
        this.scale = 2.0;
        var height = this.size.y * this.scale;
        this.pos.y += (400 - height) / 2;
      });
      this.add_to_render_list(background);
    }

    if(presentation_step > 1) {
      sprite = new Sprite("guybrush.gif", function() {
        var animation;
        animation = [
          {"orientation": "right", "num_frames": 1},
          [[47,5], [73,51]]
        ],
        this.animations["stand"] = animation;
        animation = [
          {"orientation": "right", "num_frames": 6, "frame_rate": 12},
          [[101, 116], [121, 163]],
          [[131, 116], [150, 163]],
          [[160, 116], [191, 163]],
          [[201, 116], [218, 163]],
          [[232, 116], [250, 163]],
          [[262, 116], [293, 163]],
        ];
        this.animations["walk"] = animation;
        if(animate)
          this.current_animation = "walk";
        else
          this.current_animation = "stand";
        this.scale = 2.0;
        this.pos.x = 500;
        this.pos.y = 250;
        this.pos.z = 10;
        this.speed = {x: -180, y: 0};
        this.direction = "left";
      });
      sprite.update(function(delta) {
        if(this.current_animation != "walk") return;
        if(this.pos.x < 240) {
          this.direction = "right";
          this.speed.x = -this.speed.x;
        } else if(this.pos.x > 600) {
          this.direction = "left";
          this.speed.x = -this.speed.x;
        }
        this.pos.x += this.speed.x * delta;
      });
      this.add_to_render_list(sprite);
    }

    if(presentation_step == 3) {
      background_mask = new Image("room_0_mask.gif", function() {
        this.scale = 2.0;
        var height = this.size.y * this.scale;
        this.pos.y += (400 - height) / 2;
        this.pos.z = 20;
      });
      this.add_to_render_list(background_mask);
    }

    if(presentation_step > 3) {
      background_mask = new Image("room_0_foreground.gif", function() {
        this.scale = 2.0;
        var height = this.size.y * this.scale;
        this.pos.y += (400 - height) / 2;
        this.pos.z = 20;
      });
      this.add_to_render_list(background_mask);
    }

    if(presentation_step > 4) {
      sprite.add_walk_box(1, [[240, 230], [470, 260]], [2]);
      sprite.add_walk_box(2, [[470, 200], [570, 260]], [1, 3]);
      sprite.add_walk_box(3, [[470, 260], [520, 320]], [3]);
    }

  };

  
  function Game(init) {
    this.canvas = $("#screen canvas").get(0);
    this.context = this.canvas.getContext("2d");
    this.render = [];

    this.add_to_render_list = function(object) {
      this.render.push(object);
    };

    var last_tick = getMilliseconds();

    var game = this;

    this.loop = function() {
      var render_list = [], i, object, last;
      var current_tick = getMilliseconds(), delta = Math.floor(current_tick - last_tick);
      for(i = 0; i < game.render.length; i++) {
        object = game.render[i];
        if(render_list.length == 0) {
          render_list.push(object);
          continue;
        }
        last = render_list[render_list.length - 1];
        if(object.pos.z > last.pos.z) {
          render_list.push(object);
        } else {
          render_list = ([object]).concat(render_list);
        }
      }
      game.clearContext();
      for(i = 0; i < render_list.length; i++) {
        if(render_list[i].update) render_list[i].update(null, delta);
        render_list[i].render(game.context);
      }
      last_tick = current_tick;
    };
    this.mouseEvent = function(e) {
      var x = e.offsetX, y = e.offsetY;
      window.console.log('mouse down at '+x+'/'+y);
    };
    this.clearContext = function() {
      this.context.fillStyle = "#000";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };

    init.apply(this);
  }



  function Image(image, callback) {
    var img = new global.Image(), date = new Date().getTime(), self = this;

    this.loaded = false;
    this.pos = {x: 0, y: 0, z: 0};
    this.size = {x: 0, y: 0};
    this.image = img;
    this.scale = 1.0;

    img.src = "images/"+image+'?'+date;
    img.onload = function() {
      self.size = {x: this.width, y: this.height};
      if(callback) callback.apply(self);
      self.loaded = true;
    };
    this.render = function(context, sx, sy, sw, sh, mirrorx) {
      var x = this.pos.x, y = this.pos.y, w = this.size.x * this.scale, h = this.size.y * this.scale;
      if(!this.loaded) return;
      if(mirrorx) {
        context.save();
        context.scale(-1, 1);
        x = -x;
      }
      if(sx && sy && sw && sh) {
        this.size.x = sw; this.size.y = sh;
        w = sw * this.scale; h = sh * this.scale
        x = x - (w * 0.5);
        y = y - h;
        context.drawImage(this.image, sx, sy, sw, sh, x, y, w, h);
        if(debug) {
          context.strokeStyle = "#fff";
          context.strokeRect(x, y, w, h);
        }
      } else {
        context.drawImage(this.image, x, y, w, h);
      }
      if(mirrorx) {
        context.restore();
      }
    };
  };

  function Sprite(image, callback) {
    var self = this;
    var image = new Image(image, function() {
      if(callback) callback.apply(self);
    });
    this.pos = image.pos;
    this.image = image;
    this.animations = {};
    this.current_animation = "";
    this.current_frame = 0;
    this.frame_counter = 0.0;
    this.scale = 1.0;
    this.update_callback = (function(delta) {});
    this.walkboxes = {};
    this.walkbox_connections = {};

    this.render = function(context) {
      var animation = this.animations[this.current_animation], frame, animation_info;
      if(animation) {
        animation_info = animation[0];
        frame = animation[this.current_frame+1];
        if(frame) {
          this.image.scale = this.scale;
          this.image.pos = this.pos;
          var x = frame[0][0], y = frame[0][1], sx = frame[1][0] - x, sy = frame[1][1] - y;
          this.image.render(context, x, y, sx, sy, (this.direction != animation_info["orientation"]));
          if(animation_info.num_frames > 1 && this.frame_counter > (1 / animation_info.frame_rate)) {
            this.current_frame++;
            this.frame_counter -= (1 / animation_info.frame_rate);
          }
          if(this.current_frame >= animation_info.num_frames) this.current_frame = 0;
          if(debug) {
            context.strokeStyle = "#fff";
            context.lineWidth = 2;
              context.moveTo(this.pos.x - 10, this.pos.y);
              context.lineTo(this.pos.x + 10, this.pos.y);
              context.moveTo(this.pos.x, this.pos.y - 10);
              context.lineTo(this.pos.x, this.pos.y + 10);
            context.stroke();

            context.strokeStyle = "#fff";
            context.lineWidth = 1;
            for(var index in this.walkboxes) {
              var box = this.walkboxes[index];
              context.strokeRect(box[0][0], box[0][1], box[1][0] - box[0][0], box[1][1] - box[0][1]);
            }
          }
        }
      }
    };
    this.update = function(func, delta) {
      if(func)
        this.update_callback = func;
      else if(delta) {
        delta = (delta || 1) / 1000.0;
        this.frame_counter += delta;
        this.update_callback(delta);
      }
    };
    this.add_walk_box = function(index, box, connections) {
      this.walkboxes[index] = box;
      this.walkbox_connections[index] = connections;
    };
  }


  $(document.body).keypress(function(e) {
    if(String.fromCharCode(e.charCode) == 'd') {
      debug = !debug;
    }
  });

  $(document).ready(function() {
    var game = new Game(init_game);
    global.setInterval(game.loop, 1000 / 15);
    $(game.canvas).mousedown(game.mouseEvent);
  });

})(jQuery);
