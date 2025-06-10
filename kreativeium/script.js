const canvas = document.getElementById('glcanvas');
            const gl = canvas.getContext('webgl');
            if (!gl) {
                console.error("WebGL ikke støttet!");
                document.body.innerHTML = 'Nettleseren din støtter ikke WebGL.';
            }

            // Funksjon for å kompilere en shader
            function createShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
                if (success) {
                    return shader;
                }
                console.error("Feil ved kompilering av shader:",
    gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
            }

            // Funksjon for å lage shaderprogrammet
            function createProgram(gl, vertexShader, fragmentShader) {
                const program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                const success = gl.getProgramParameter(program, gl.LINK_STATUS);
                if (success) {
                    return program;
                }
                console.error("Feil ved linking av program:",
    gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
            }

            // Hent shaderkoden fra HTML-skript-taggene
            const vertexShaderSource =
    document.getElementById('vertex-shader').textContent;
            const fragmentShaderSource =
    document.getElementById('fragment-shader').textContent;

            // Kompiler og link shaderne
            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER,
    fragmentShaderSource);
            const program = createProgram(gl, vertexShader, fragmentShader);

            // Finn uniform-lokasjoner
            const resolutionLocation = gl.getUniformLocation(program, "iResolution");
            const timeLocation = gl.getUniformLocation(program, "iTime");
            const animationSpeedLocation = gl.getUniformLocation(program,
    "u_animationSpeed");
            const baseNoiseScaleLocation = gl.getUniformLocation(program,
    "u_baseNoiseScale");
            const warpFactor1Location = gl.getUniformLocation(program, "u_warpFactor1");
            const warpFactor2Location = gl.getUniformLocation(program, "u_warpFactor2");
            const colorALocation = gl.getUniformLocation(program, "u_colorA");
            const colorBLocation = gl.getUniformLocation(program, "u_colorB");
            const shininessLocation = gl.getUniformLocation(program, "u_shininess");
            const specularStrengthLocation = gl.getUniformLocation(program,
    "u_specularStrength");

            // Finn attributt-lokasjon
            const positionLocation = gl.getAttribLocation(program, "a_position");

            // Lag en buffer for å holde hjørneposisjonene til en firkant
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            // Funksjon for å endre størrelse på canvaset
            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            }
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            let startTime = Date.now();

            // Shader controls object for lil-gui
            const shaderControls = {
                animationSpeed: 1.0,
                baseNoiseScale: 1.0,
                warpFactor1: 0.03,
                warpFactor2: 0.04,
                colorA: [0.2, 0.1, 0.4], // lil-gui expects array for colors
                colorB: [0.3, 0.05, 0.05], // lil-gui expects array for colors
                shininess: 32.0,
                specularStrength: 0.8
            };

            // Setup lil-gui
            const gui = new lil.GUI();
            gui.add(shaderControls, 'animationSpeed', 0.0, 5.0).name('Animation Speed');
            gui.add(shaderControls, 'baseNoiseScale', 0.1, 5.0).name('Noise Scale');
            gui.add(shaderControls, 'warpFactor1', 0.0, 0.2, 0.001).name('Warp Factor 1');
            gui.add(shaderControls, 'warpFactor2', 0.0, 0.2, 0.001).name('Warp Factor 2');
            gui.addColor(shaderControls, 'colorA').name('Color A');
            gui.addColor(shaderControls, 'colorB').name('Color B');
            gui.add(shaderControls, 'shininess', 1.0, 128.0).name('Shininess');
            gui.add(shaderControls, 'specularStrength', 0.0, 1.0).name('Specular Strength');

            // Tegnefunksjon (animasjonsløkke)
            function render() {
                const currentTime = (Date.now() - startTime) * 0.001; // Tid i sekunder

                gl.useProgram(program);

                // Aktiver posisjonsattributtet
                gl.enableVertexAttribArray(positionLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                // Sett uniforms
                gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
                gl.uniform1f(timeLocation, currentTime);

                // Set new uniforms from GUI controls
                gl.uniform1f(animationSpeedLocation, shaderControls.animationSpeed);
                gl.uniform1f(baseNoiseScaleLocation, shaderControls.baseNoiseScale);
                gl.uniform1f(warpFactor1Location, shaderControls.warpFactor1);
                gl.uniform1f(warpFactor2Location, shaderControls.warpFactor2);
                gl.uniform3fv(colorALocation, shaderControls.colorA);
                gl.uniform3fv(colorBLocation, shaderControls.colorB);
                gl.uniform1f(shininessLocation, shaderControls.shininess);
                gl.uniform1f(specularStrengthLocation, shaderControls.specularStrength);

                // Tegn firkanten
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                requestAnimationFrame(render);
            }

            // Start animasjonen
            render(); 