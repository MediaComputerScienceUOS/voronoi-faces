// Generated by CoffeeScript 1.7.1
(function() {
  var FaceApp,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FaceApp = (function() {
    function FaceApp(canvas, picture) {
      this.canvas = canvas;
      this.picture = picture;
      this.detectFaces = __bind(this.detectFaces, this);
      this.removeClosest = __bind(this.removeClosest, this);
      this.doVoronoi = __bind(this.doVoronoi, this);
      this.drawMarkers = __bind(this.drawMarkers, this);
      this.drawMask = __bind(this.drawMask, this);
      this.drawNumbers = __bind(this.drawNumbers, this);
      this.drawCells = __bind(this.drawCells, this);
      this.draw = __bind(this.draw, this);
      this.drawEdges = __bind(this.drawEdges, this);
      this.drawImage = __bind(this.drawImage, this);
      this.sortFaces = __bind(this.sortFaces, this);
      this.resetData = __bind(this.resetData, this);
      this.update = __bind(this.update, this);
      this.picture.load((function(_this) {
        return function() {
          var pic;
          pic = _this.picture[0];
          pic.crossOrigin = "Anonymous";
          _this.canvas[0].width = pic.naturalWidth;
          _this.canvas[0].height = pic.naturalHeight;
          _this.canvas.width(pic.naturalWidth);
          _this.canvas.height(pic.naturalHeight);
          return _this.drawImage();
        };
      })(this));
      this.ctx = this.canvas[0].getContext('2d');
      this.faces = [];
      this.cells = [];
      this.diagram = null;
      this.printView = false;
      this.update();
      this.init();
    }

    FaceApp.prototype.update = function() {
      this.doVoronoi();
      this.sortFaces();
      return this.draw(this.printView);
    };

    FaceApp.prototype.resetData = function() {
      this.faces = [];
      return this.update();
    };

    FaceApp.prototype.sortFaces = function() {
      var score;
      score = function(face) {
        return face.y * 100 + face.x;
      };
      this.faces.sort(function(a, b) {
        return score(a) - score(b);
      });
      return this.faces.forEach(function(face, index) {
        return face.voronoiId = index + 1;
      });
    };

    FaceApp.prototype.drawImage = function() {
      var pic;
      pic = this.picture[0];
      return this.ctx.drawImage(pic, 0, 0);
    };

    FaceApp.prototype.drawEdges = function(style) {
      if (this.faces.length === 0) {
        return;
      }
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = style != null ? style : "#0f0";
      this.ctx.beginPath();
      this.diagram.edges.forEach((function(_this) {
        return function(edge) {
          _this.ctx.moveTo(edge.va.x, edge.va.y);
          return _this.ctx.lineTo(edge.vb.x, edge.vb.y);
        };
      })(this));
      return this.ctx.stroke();
    };

    FaceApp.prototype.draw = function(print) {
      this.ctx.clearRect(0, 0, this.canvas.width(), this.canvas.height());
      this.drawImage();
      if (print) {
        this.drawMask();
      }
      this.drawEdges(print ? "#000" : "#fff");
      if (!print) {
        this.drawMarkers();
      }
      if (print) {
        return this.drawNumbers();
      }
    };

    FaceApp.prototype.drawCells = function(style) {
      this.ctx.strokeStyle = style;
      return this.cells.forEach((function(_this) {
        return function(cell) {
          var poly;
          poly = cell.points;
          _this.ctx.beginPath();
          if (poly.length === 0) {
            return;
          }
          _this.ctx.moveTo(poly[0].x, poly[0].y);
          poly.forEach(function(point) {
            return _this.ctx.lineTo(point.x, point.y);
          });
          _this.ctx.closePath();
          return _this.ctx.stroke();
        };
      })(this));
    };

    FaceApp.prototype.drawNumbers = function() {
      var ctx, face, rect, _i, _len, _ref, _results;
      ctx = this.ctx;
      ctx.fillStyle = "#000";
      ctx.font = "20px Sans";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      rect = this.canvas[0].getBoundingClientRect();
      _ref = this.faces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        face = _ref[_i];
        _results.push(ctx.fillText(face.voronoiId, face.x, face.y));
      }
      return _results;
    };

    FaceApp.prototype.drawMask = function() {
      this.ctx.fillStyle = "rgba(255,255,255,0.5)";
      return this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height());
    };

    FaceApp.prototype.drawMarkers = function() {
      var ctx;
      if (this.faces.length === 0) {
        return;
      }
      ctx = this.ctx;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(150,150,255,0.35)";
      return this.faces.forEach(function(face) {
        var w;
        w = 4;
        ctx.beginPath();
        ctx.arc(face.x, face.y, 2 * w, 0, Math.PI * 2, true);
        ctx.fill();
        return ctx.stroke();
      });
    };

    FaceApp.prototype.doVoronoi = function() {
      var bbox, cell, f, he, sites, voronoi;
      bbox = {
        xl: 0,
        xr: this.canvas.width(),
        yt: 0,
        yb: this.canvas.height()
      };
      voronoi = new Voronoi();
      sites = (function() {
        var _i, _len, _ref, _results;
        _ref = this.faces;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          _results.push({
            x: f.x,
            y: f.y
          });
        }
        return _results;
      }).call(this);
      this.diagram = voronoi.compute(sites, bbox);
      return this.cells = (function() {
        var _i, _len, _ref, _results;
        _ref = this.diagram.cells;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          _results.push({
            id: cell.site.voronoiId,
            x: cell.site.x,
            y: cell.site.y,
            points: _.flatten((function() {
              var _j, _len1, _ref1, _results1;
              _ref1 = cell.halfedges;
              _results1 = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                he = _ref1[_j];
                _results1.push([
                  {
                    x: he.getStartpoint().x >> 0,
                    y: he.getStartpoint().y >> 0
                  }, {
                    x: he.getEndpoint().x >> 0,
                    y: he.getEndpoint().y >> 0
                  }
                ]);
              }
              return _results1;
            })())
          });
        }
        return _results;
      }).call(this);
    };

    FaceApp.prototype.removeClosest = function(faces, pos) {
      var dist, minDist, minIndex;
      dist = function(a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
      };
      minIndex = -1;
      minDist = 5 * (this.canvas.width() + this.canvas.height());
      this.faces.forEach(function(face, idx) {
        var d;
        d = dist(face, pos);
        if (d < minDist) {
          minDist = d;
          return minIndex = idx;
        }
      });
      if (minIndex === -1) {
        return;
      }
      return this.faces.splice(minIndex, 1);
    };

    FaceApp.prototype.detectFaces = function(e) {
      e.target.disabled = true;
      this.resetData();
      this.draw();
      return this.picture.faceDetection({
        async: false,
        grayscale: false,
        minNeighbors: 1,
        interval: 6,
        complete: (function(_this) {
          return function(f) {
            f.forEach(function(fc) {
              return _this.faces.push({
                x: (fc.x + fc.width / 2) >> 0,
                y: (fc.y + fc.height / 2) >> 0
              });
            });
            e.target.disabled = false;
            return _this.update();
          };
        })(this),
        error: function(code, msg) {
          return console.log('Oh no! Error ' + code + ' occurred. The message was "' + msg + '".');
        }
      });
    };

    FaceApp.prototype.init = function() {
      var addOrRemoveSite, button, printButton, toggle;
      button = $('#detectfaces');
      button.prop('disabled', false);
      button.click(this.detectFaces);
      printButton = $('#printview');
      printButton.prop('disabled', false);
      toggle = (function(_this) {
        return function() {
          _this.printView = !_this.printView;
          _this.update();
          return printButton.attr('value', (_this.printView ? "edit" : "print") + " view");
        };
      })(this);
      printButton.click(toggle);
      addOrRemoveSite = (function(_this) {
        return function(e) {
          var cx, cy, rect;
          rect = _this.canvas[0].getBoundingClientRect();
          cx = (e.clientX - rect.left) >> 0;
          cy = (e.clientY - rect.top) >> 0;
          if (e.ctrlKey || e.metaKey) {
            _this.removeClosest(_this.faces, {
              x: cx,
              y: cy
            });
          } else {
            _this.faces.push({
              x: cx,
              y: cy,
              width: 0,
              height: 0
            });
          }
          return _this.update();
        };
      })(this);
      this.canvas.click(addOrRemoveSite);
      $('#savehtml').click((function(_this) {
        return function() {
          var foo, p, poly, polys;
          polys = (function() {
            var _i, _len, _ref, _results;
            _ref = this.cells;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              poly = _ref[_i];
              _results.push('<area shape="poly" coords="' + (_.flatten((function() {
                var _j, _len1, _ref1, _results1;
                _ref1 = poly.points;
                _results1 = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  p = _ref1[_j];
                  _results1.push([p.x, p.y]);
                }
                return _results1;
              })())) + '" href="javascript:;" data-id="' + poly.id + '" data-x="' + poly.x + '" data-y="' + poly.y + '" />\n');
            }
            return _results;
          }).call(_this);
          foo = new Blob(polys, {
            type: "text/html;charset=utf-8"
          });
          return saveAs(foo, "areas.html");
        };
      })(this));
      $('#savefile').click((function(_this) {
        return function() {
          var f, facesPlusIds, foo;
          facesPlusIds = (function() {
            var _i, _len, _ref, _results;
            _ref = this.faces;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              f = _ref[_i];
              _results.push({
                x: f.x,
                y: f.y,
                id: f.voronoiId
              });
            }
            return _results;
          }).call(_this);
          foo = new Blob([JSON.stringify(facesPlusIds, null, 2)], {
            type: "application/json;charset=utf-8"
          });
          return saveAs(foo, "faces.json");
        };
      })(this));
      return $('#loadfile').change((function(_this) {
        return function(e) {
          var file, reader;
          file = e.target.files[0];
          if (file == null) {
            return;
          }
          reader = new FileReader();
          reader.onload = function(e) {
            var contents;
            contents = e.target.result;
            _this.faces = JSON.parse(contents);
            return _this.update();
          };
          return reader.readAsText(file);
        };
      })(this));
    };

    return FaceApp;

  })();

  $(document).ready(function() {
    return new FaceApp($('#canvas'), $('#picture'));
  });

}).call(this);
