if(!Vars.headless){

const GL = this.global;
GL.shader = null;

var DefaultApplies = "this.setUniformf(\"u_time\", Time.time / Scl.scl(3))\nthis.setUniformf(\"u_color\", Tmp.c1.set(Color.white).lerp(Color.red, Mathf.sin(Time.time*0.2)*0.5+0.5))\n";
var DefaultVertex = "uniform mat4 u_projTrans;\n"+
   "attribute vec4 a_position;\n"+
   "attribute vec2 a_texCoord0;\n"+
   "attribute vec4 a_color;\n"+
   "varying vec4 v_color;\n"+
   "varying vec2 v_texCoord;\n"+
   "void main(){\n"+
	   "gl_Position = u_projTrans * a_position;\n"+
	   "v_texCoord = a_texCoord0;\n"+
	   "v_color = a_color;\n"+
   "}";
var DefaultFragment = "#define HIGHP\n"+
   "uniform sampler2D u_texture;\n"+
   "uniform float u_time;\n"+
   "varying vec4 v_color;\n"+
   "varying vec2 v_texCoord;\n"+
   "void main(){\n"+
	   "vec4 color = texture2D(u_texture, v_texCoord.xy);\n"+
	   "float t = clamp((sin(u_time * 0.4 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1) + 1.0) / 2.0, 0.0, 1.0);\n"+
	   "vec3 c = vec3(mix(0.0, 1.0, t), mix(0.89, 0.39, t), mix(1.0, 0.85, t));\n"+
	   "gl_FragColor = vec4(color.rgb * c.rgb, color.a);\n"+
   "}"; 


const SM = extend(LiquidBlock, "sm", {
	update: true, 
	solid: false, 
	solidifes: false, 
	destroyable: false, 
	configurable: true, 
	hasLiquids: false, 
	outputsLiquid: false, 
	size: 16,
	buildVisibility: BuildVisibility.sandboxOnly, 
	category: Category.effect
});
SM.buildType = () => {
	const ent = extendContent(LiquidBlock.LiquidBuild, SM, {
		init(tile, team, shouldAdd, rotation){
			this.super$init(tile, team, shouldAdd, rotation);
			
			this.setApplies(DefaultApplies);
			this.setError(" ");
			this.setShader(GL.shader == null ? this.createShader(DefaultApplies, DefaultVertex, DefaultFragment) : GL.shader);
			this.setVert(DefaultVertex);
			this.setFrag(DefaultFragment);

			return this;
	   }, 
		
       createShader(appliesString, vert, frag) {
		    importPackage(Packages.arc.graphics.gl); 
		    try{
		        GL.shader = new JavaAdapter(Shader, {
				    apply(){
	                	var applies = [];
	                    var apply = "";
	                    
			            for(var i = 0; i < appliesString.length; i++) {
			                var ch = appliesString.charAt(i);
			           
			                apply += ch
			                if(ch == "\n") {
			                	applies.push(apply);
			                    apply = ""
			                } 
			            }; 
			
					    for(var i = 0; i < applies.length; i++){
						    let a = applies[i];
						 
					        eval(a);
				        } 
			        }
			    }, vert, frag);
			} catch(e){ this.setError(e) };
			
		    return GL.shader 
		}, 
		
		draw() {
            if(this.getError() != " ") {
                Draw.rect(Core.atlas.find("error"), this.x, this.y, 8*16, 8*16);
                
                return
            };
           
			Draw.draw(Draw.z(), () => {
				Draw.shader(this.getShader());
				Draw.rect(Core.atlas.white(), this.x, this.y, 8*16, 8*16)
				Draw.shader();
		    })
	    }, 
	
	    buildConfiguration(table) {
		    var dialog = new BaseDialog("@dialog.sm-title.name");
	        var cont = dialog.cont;
			
            var applies = "";
            var vertex = "";
            var fragment = "";
            
            for(var i = 0; i < this.getApplies().length; i++) {
                 var string = this.getApplies().charAt(i);
                 applies += string;
            };

            for(var i = 0; i < this.getVert().length; i++) {
                 var string = this.getVert().charAt(i);
                 vertex += string;
            };

            for(var i = 0; i < this.getFrag().length; i++) {
                 var string = this.getFrag().charAt(i);
                 fragment += string
            };
 
            this.text(cont, "@text.shader-applies"); 
  
            var textApplies;
			cont.pane(
                cons(p => {
					textApplies = p.add(new TextArea(applies.toString().replace("\n", "\r"))).size(550, 120).get();
					textApplies.setMaxLength(2000);
				})
            ).width(650).height(170).growY().row();
 
            this.text(cont, "@text.shader-vertex");
 
            var textVertex;
			cont.pane(
                cons(p => {
	                textVertex = p.add(new TextArea(vertex.toString().replace("\n", "\r"))).size(630, 480).get();
	                textVertex.setMaxLength(10000);
				})
            ).width(650).height(300).growY().row();
 
            this.text(cont, "@text.shader-fragment");
 
            var textFragment;
			cont.pane(
                cons(p => {
	                textFragment = p.add(new TextArea(fragment.toString().replace("\n", "\r"))).size(630, 480).get();
	                textFragment.setMaxLength(10000);
				})
            ).width(650).height(300).growY().row();

			/*cont.table(
	            cons(
                    t => {     
						t.button("@button.copy-shader", 
		                    () => {
			                    var appls = "" ;
			                    for(var i = 0; i < this.getApplies().size; i++) {
				                    let 
				                    appls += "               ";
			                    };
			
			                    Core.app.setClipboardText(""+
									"if(!Vars.headless){\n"+
										"importPackage(Packages.arc.graphics.gl);\n"+
										"newShader = new JavaAdapter(Shader, {\n"+
										"apply(){\n"+

    
							} 
	                    ).growX().height(54).pad(4).row();
					}
                )
            ).width(300);**/
	
	        textApplies.typed(
                cons(c => {
		            this.setApplies(textApplies.getText());
                })
            );
	
	        textFragment.typed(
                cons(c => {
                	this.setFrag(textFragment.getText())
                })
            );
            
	        textVertex.typed(
                cons(c => {
                	this.setVert(textVertex.getText())
                })
            );
             
             
             
	        if(Vars.mobile) {
                cont.row().marginTop(40);
		        table.button("A", () => { 
	                const input = new Input.TextInput();
	                input.multiline = true;
	                input.text = this.getApplies();
	                input.accepted = cons(text => this.setApplies(text) );
	                Core.input.getTextInput(input);
		         });
              
		         table.button("V", () => { 
	                const input = new Input.TextInput();
	                input.multiline = true;
	                input.text = this.getVert();
	                input.accepted = cons(text => this.setVert(text));
	                Core.input.getTextInput(input);
		         });
              
		         table.button("F", () => { 
	                const input = new Input.TextInput();
	                input.multiline = true;
	                input.text = this.getFrag();
	                input.accepted = cons(text => this.setFrag(text));
	                Core.input.getTextInput(input);
		        });
		    };
	
	         table.button(Icon.play, () => { 
                this.setShader(this.createShader(this.getApplies(), this.getVert(), this.getFrag()))
	        }).center();
	
	         if(this.getError() != " ") table.button(Icon.none, () => { 
                Vars.ui.showErrorMessage(this.getError());
                
                Time.run(150, () => this.setError(" "));
	        }).center();
		
	        dialog.addCloseButton();
		    table.button(Icon.pencil, () => {
			    dialog.show();
            });
		}, 
	
	    text(cont, text) {
			cont.table(
                cons(t => {
					t.top().margin(6);
					t.add(text).center().color(Pal.accent);
					t.row();
					t.image().fillX().height(3).pad(4).color(Pal.accent);
				})
            ).width(400).center().row();
		},
        
		writeBase(write){
			this.super$writeBase(write);
 
			write.str(this._vert);
			write.str(this._frag);
			write.str(this._applies);
			write.str(this._err);
		},

		readBase(read){
			this.super$readBase(read);

			this._vert = read.str();
			this._frag = read.str();
			this._applies = read.str();
			this._err = read.str();
			
            this.setShader(this.createShader(this._applies, this._vert, this._frag))
		},
        
		setApplies(a){
			this._applies = a;
		},

		getApplies(){
			return this._applies;
		}, 
        
		setShader(a){
			GL.shader = a;
		},

		getShader(){
			return GL.shader;
		}, 
		
		setError(a){
			this._err = a;
		},

		getError(){
			return this._err;
		}, 
        
		setVert(a){
			this._vert = a;
		},

		getVert(){
			return this._vert;
		}, 
        
		setFrag(a){
			this._frag = a;
		},

		getFrag(){
			return this._frag;
		}
	});
	return ent;
}

} //If !Vars.headless, then this machine simply will not be in the game 
