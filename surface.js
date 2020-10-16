// common variables of the u, v curves
var w_arr, points, arr, drawed, parchanged, pointsize_arr, mouseymin, mousexmax, on_point;
// variables of v direction
var v_degree, v_degreep1, v_n, v_nplus1, v_U, v_container, v_degchanged, v_t_step;
// variables of u direction
var u_degree, u_degreep1, u_n, u_nplus1, u_U, u_container, u_degchanged, u_t_step;

var scp_arr, cam, zunit, FELB, puff_arr, sugar, szog1, szog2, drawcn, drawcp, drawkp, notPopup;

// calculate nurbs weight for a given controllpoint (idx) and parameter (t)
function nurbs_weight(idx, t, degree, U) {
    // arr will contain the values of the weight functions at different levels
    // first, calculate the values of the level zero weight functions
    arr.fill(0);
    // at level zero find the knot range that return 1 for the parameter value t
    for ( var x = idx + degree; x >= idx; --x ) {
        if ( t >= U[x] ) {
            // if knot range is invalid then return 0 (to eliminate NaN return value)
            if ( U[x] == U[x + 1] ) {
                return 0;
            }
            arr[x - idx] = 1;
            break;
        }
    }
    // compute the values of the weight functions from level one to level p (degree)
    var level = 1;
    // on level one there are p (degree) weight functions, the next level with one less, and so on...
    for ( x = degree; x >= 1; --x ) {
        // at the given level compute all values of weight functions
        for ( var y = 0; y < x; ++y ) {
            let ii = idx + y;
            if ( arr[y] != 0 ) {
                arr[y] = ((t - U[ii]) / (U[ii + level] - U[ii])) * arr[y];
            }
            if ( arr[y + 1] != 0 ) {
                arr[y] += ((U[ii + level + 1] - t) / (U[ii + level + 1] - U[ii + 1])) * arr[y + 1];
            }
        }
        ++level;
    }
    // arr[0] is the value of the N(idx, p)(t) from the formula
    return arr[0];
}

function setup() {
    // setAttributes('antialias', true);

    // assignments of parameters
    u_degree = 3; u_degreep1 = u_degree + 1; u_n = 6; u_nplus1 = u_n + 1;
    v_degree = 3; v_degreep1 = v_degree + 1; v_n = 6; v_nplus1 = v_n + 1;
    // control points weigths array
    w_arr = new Array(49).fill(1);
    // control points draw sizes
    pointsize_arr = new Array(49).fill(1);
    // knot vector with two endpoints interpolation
    u_U = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    v_U = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // set the resolution
    FELB = 25;
    // allock puffer array
    puff_arr = new Array((FELB + 1) * 3);
    // split the curve to FELB parts
    u_t_step = (u_U[u_nplus1] - u_U[u_degree]) / FELB;
    v_t_step = (v_U[v_nplus1] - v_U[v_degree]) / FELB;
    // full window canvas creation on the webpage
    var canvasDiv = document.getElementById('cvas');
    let myCanvas = createCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight - 4, WEBGL);
    myCanvas.parent('cvas');
    cam = createCamera();
    // for mouse events
    addScreenPositionFunction();
    // toenforce mouse event within canvas
    mousexmax = windowWidth - document.getElementById('two').offsetWidth;
    mouseymin = document.getElementById('leiras').offsetHeight;
    // define the controllpoints
    zunit = width * 0.875 / v_n;
    points = [
                0.10 * width, 0.42 * height, 3 * zunit,
                0.22 * width, 0.22 * height, 3 * zunit,
                0.36 * width, 0.32 * height, 3 * zunit,
                0.46 * width, 0.70 * height, 3 * zunit,
                0.62 * width, 0.83 * height, 3 * zunit,
                0.76 * width, 0.66 * height, 3 * zunit,
                0.84 * width, 0.42 * height, 3 * zunit,
                0.24 * width, 0.60 * height, 2 * zunit,
                0.25 * width, 0.80 * height, 2 * zunit,
                0.28 * width, 0.17 * height, 2 * zunit,
                0.68 * width, 0.44 * height, 2 * zunit,
                0.72 * width, 0.48 * height, 2 * zunit,
                0.76 * width, 0.12 * height, 2 * zunit,
                0.81 * width, 0.63 * height, 2 * zunit,
                0.07 * width, 0.92 * height, 1 * zunit,
                0.23 * width, 0.52 * height, 1 * zunit,
                0.38 * width, 0.76 * height, 1 * zunit,
                0.51 * width, 0.78 * height, 1 * zunit,
                0.71 * width, 0.85 * height, 1 * zunit,
                0.77 * width, 0.42 * height, 1 * zunit,
                0.85 * width, 0.87 * height, 1 * zunit,
                0.09 * width, 0.23 * height, 0,
                0.13 * width, 0.16 * height, 0,
                0.15 * width, 0.77 * height, 0,
                0.17 * width, 0.88 * height, 0,
                0.24 * width, 0.27 * height, 0,
                0.82 * width, 0.34 * height, 0,
                0.84 * width, 0.51 * height, 0,
                0.02 * width, 0.56 * height, -1 * zunit,
                0.07 * width, 0.32 * height, -1 * zunit,
                0.13 * width, 0.85 * height, -1 * zunit,
                0.17 * width, 0.48 * height, -1 * zunit,
                0.30 * width, 0.18 * height, -1 * zunit,
                0.64 * width, 0.27 * height, -1 * zunit,
                0.76 * width, 0.79 * height, -1 * zunit,
                0.01 * width, 0.21 * height, -2 * zunit,
                0.21 * width, 0.17 * height, -2 * zunit,
                0.26 * width, 0.06 * height, -2 * zunit,
                0.38 * width, 0.87 * height, -2 * zunit,
                0.51 * width, 0.53 * height, -2 * zunit,
                0.70 * width, 0.62 * height, -2 * zunit,
                0.71 * width, 0.73 * height, -2 * zunit,
                0.07 * width, 0.31 * height, -3 * zunit,
                0.19 * width, 0.64 * height, -3 * zunit,
                0.30 * width, 0.11 * height, -3 * zunit,
                0.41 * width, 0.34 * height, -3 * zunit,
                0.70 * width, 0.94 * height, -3 * zunit,
                0.85 * width, 0.91 * height, -3 * zunit,
                0.91 * width, 0.42 * height, -3 * zunit
             ];
    sugar = 2 * (height / 2) / (tan(PI * 60 / 360));
    szog1 = PI / 6;
    szog2 = PI / 4;
    // arr will contain the values of the weight functions at different levels
    arr = new Array(7).fill(0);
    drawcn = true;
    drawcp = true;
    drawkp = true;
    notPopup = true;
    // there is no selected point
    on_point = -1;
    parchanged = true;
    v_degchanged = true;
    u_degchanged = true;
    drawed = false;
}

function draw() {
    keyWatch();
    // draw the curve on page loading and when the parameters have changed
    if( !drawed ){
        // clear the canvas
        background(111);
        // console.log(cam.eyeX, cam.eyeY, cam.eyeZ);
        // console.log(cam.centerX, cam.centerY, cam.centerZ);
        // console.log(cam.upX, cam.upY, cam.upZ);
        // cam.setPosition(-width / 1.5, -height * 1.5, cam.eyeZ);
        cam.setPosition(-sugar * sin(szog2) * cos(szog1), -sugar * sin(szog1), sugar * cos(szog1) * cos(szog2));
        cam.lookAt(0,0,0);
        // console.log(cam.eyeX, cam.eyeY, cam.eyeZ);
        // console.log(cam.centerX, cam.centerY, cam.centerZ);
        // console.log(cam.upX, cam.upY, cam.upZ);
        
        translate(-width / 2, -height / 2)
        // rotate and zoom in 3d
        // orbitControl();
        if(drawcn){
            // point / line width
            strokeWeight(4);
            // controll poligon
            // point / line color
            stroke(0);
            noFill();
            for ( var i = 0; i < points.length; i += 21 ) {
                beginShape();
                for ( let j = i; j < i + 21; j += 3 ) {
                    vertex(points[j], points[j + 1], points[j + 2]);
                }
                endShape();
            }
            for ( i = 0; i < u_nplus1; ++i ) {
                beginShape();
                for ( let j = i * 3; j < points.length; j += 21 ) {
                    vertex(points[j], points[j + 1], points[j + 2]);
                }
                endShape();
            }
        }
        stroke(255, 50, 50);
        if( parchanged ){
            u_t_step = (u_U[u_nplus1] - u_U[u_degree]) / FELB;
            v_t_step = (v_U[v_nplus1] - v_U[v_degree]) / FELB;
            
            // fill weigts container in u direction
            if ( u_degchanged ) {
                u_container = new Array((FELB + 1) * (u_degreep1));
                u_degchanged = false;
            }
            // end knot for curve - floating point error
            var tnplus1 = u_U[u_nplus1] - u_t_step / 2;
            let k = 0;
            for ( let t = u_U[u_degree]; t < tnplus1; t += u_t_step, ++k ) {
                // calculate the start and end indices of the points which will have non zero weigts
                let startWFi = 0, endWFi = 0;
                for ( i = u_n; ; --i ) {
                    if ( t >= u_U[i] ) {
                        endWFi = i;
                        startWFi = i - u_degree;
                        break;
                    }
                }
                let j = 0;
                for ( i = startWFi; i <= endWFi; ++i, ++j ) {
                    u_container[k * u_degreep1 + j] = nurbs_weight(i, t, u_degree, u_U);
                }
            }
            
            // fill weigts container in v direction
            if ( v_degchanged ) {
                v_container = new Array((FELB + 1) * (v_degreep1));
                v_degchanged = false;
            }
            var tnplus1 = v_U[v_nplus1] - v_t_step / 2;
            k = 0;
            for ( let t = v_U[v_degree]; t < tnplus1; t += v_t_step, ++k ) {
                // calculate the start and end indices of the points which will have non zero weigts
                let startWFi = 0, endWFi = 0;
                for ( i = v_n; ; --i ) {
                    if ( t >= v_U[i] ) {
                        endWFi = i;
                        startWFi = i - v_degree;
                        break;
                    }
                }
                let j = 0;
                for ( i = startWFi; i <= endWFi; ++i, ++j ) {
                    v_container[k * v_degreep1 + j] = nurbs_weight(i, t, v_degree, v_U);
                }
            }
            parchanged = false;
        }
        // calculate the vertices of the curve
        fill(0, 255, 0);
        strokeWeight(2);
        // noStroke();
        ambientLight(60, 60, 60);
        pointLight(249, 249, 129, 0, 0, 3 * zunit);
        // lights();
        // directionalLight(250, 250, 250, ((cam.eyeX - width / 2) / width - 0.5) * 2, ((cam.eyeY - height / 2) / height - 0.5) * 2, -1);
        // directionalLight(0, 255, 0, sin(szog2) * cos(szog1), sin(szog1), -cos(szog1) * cos(szog2));
        // pointLight(255, 255, 255, cam.eyeX, cam.eyeY, cam.eyeZ);
        ambientMaterial(255);
        let deb1 = 0;
        // for ( let kk = 0; kk < U.length; ++kk ) {
        //     console.log(U[kk]);
        // }
        // end knot for curve - floating point error
        let u_tnplus1 = u_U[u_nplus1] - u_t_step / 2;
        let v_tnplus1 = v_U[v_nplus1] - v_t_step / 2;
        // for ( let v = 0; v < v_container.length / v_degreep1; ++v ) {
        // for ( let u = 0; u < u_container.length / u_degreep1; ++u ) {
        // looping the t parameter from t|degree to t|nplus1
        let vc = 0, v = v_U[v_degree];
        // calculate the start and end indices of the points which will have non zero weigts
        let v_startWFi = 0, v_endWFi = 0;
        for ( i = v_n; ; --i ) {
            if ( v >= v_U[i] ) {
                v_endWFi = i;
                v_startWFi = i - v_degree;
                break;
            }
        }
        let uc = 0;
        for ( let u = u_U[u_degree]; u < u_tnplus1; u += u_t_step, ++uc ) {
            // calculate the start and end indices of the points which will have non zero weigts
            let u_startWFi = 0, u_endWFi = 0;
            for ( i = u_n; ; --i ) {
                if ( u >= u_U[i] ) {
                    u_endWFi = i;
                    u_startWFi = i - u_degree;
                    break;
                }
            }
            // calculate the bsplineweights * points * pointweights
            let sum_x = 0, sum_y = 0, sum_z = 0, nw_sum = 0, jc = 0;
            for ( let j = v_startWFi; j <= v_endWFi; ++j, ++jc ) {
                let kc = 0;
                for ( let k = u_startWFi; k <= u_endWFi; ++k, ++kc ) {
                    let nw = v_container[vc * v_degreep1 + jc] * u_container[uc * u_degreep1 + kc] * w_arr[u_nplus1 * j + k];
                    nw_sum += nw;
                    sum_x += nw * points[(u_nplus1 * j + k) * 3];
                    sum_y += nw * points[(u_nplus1 * j + k) * 3 + 1];
                    sum_z += nw * points[(u_nplus1 * j + k) * 3 + 2];
                }
            }
            // create only valid vertex
            if ( nw_sum > 0 ) {
                let nurbs_div = 1 / nw_sum;
                puff_arr[uc * 3] = sum_x * nurbs_div;
                puff_arr[uc * 3 + 1] = sum_y * nurbs_div;
                puff_arr[uc * 3 + 2] = sum_z * nurbs_div;
            }else {
                ++deb1;
            }
        }
        // console.log(uc);
        
        vc = 1;
        for ( v = v_U[v_degree] + v_t_step; v < v_tnplus1; v += v_t_step, ++vc ) {
            beginShape(TRIANGLE_STRIP);
            // calculate the start and end indices of the points which will have non zero weigts
            v_startWFi = 0, v_endWFi = 0;
            for ( i = v_n; ; --i ) {
                if ( v >= v_U[i] ) {
                    v_endWFi = i;
                    v_startWFi = i - v_degree;
                    break;
                }
            }
            uc = 0;
            for ( let u = u_U[u_degree]; u < u_tnplus1; u += u_t_step, ++uc ) {
                vertex(puff_arr[uc * 3], puff_arr[uc * 3 + 1], puff_arr[uc * 3 + 2]);
                // calculate the start and end indices of the points which will have non zero weigts
                let u_startWFi = 0, u_endWFi = 0;
                for ( i = u_n; ; --i ) {
                    if ( u >= u_U[i] ) {
                        u_endWFi = i;
                        u_startWFi = i - u_degree;
                        break;
                    }
                }
                // calculate the bsplineweights * points * pointweights
                let sum_x = 0, sum_y = 0, sum_z = 0, nw_sum = 0, jc = 0;
                for ( let j = v_startWFi; j <= v_endWFi; ++j, ++jc ) {
                    let kc = 0;
                    for ( let k = u_startWFi; k <= u_endWFi; ++k, ++kc ) {
                        let nw = v_container[vc * v_degreep1 + jc] * u_container[uc * u_degreep1 + kc] * w_arr[u_nplus1 * j + k];
                        nw_sum += nw;
                        sum_x += nw * points[(u_nplus1 * j + k) * 3];
                        sum_y += nw * points[(u_nplus1 * j + k) * 3 + 1];
                        sum_z += nw * points[(u_nplus1 * j + k) * 3 + 2];
                    }
                }
                // create only valid vertex
                if ( nw_sum > 0 ) {
                    let nurbs_div = 1 / nw_sum;
                    vertex(sum_x * nurbs_div, sum_y * nurbs_div, sum_z * nurbs_div);
                    puff_arr[uc * 3] = sum_x * nurbs_div;
                    puff_arr[uc * 3 + 1] = sum_y * nurbs_div;
                    puff_arr[uc * 3 + 2] = sum_z * nurbs_div;
                }else {
                    ++deb1;
                }
            }
            endShape();
        }
        // console.log(vc);
            
        
        // console.log(deb1);
        
        if(drawkp){
            // draw knotpoints
            stroke(50, 50, 255);
            strokeWeight(10);
            for ( v = v_degree; v < v_nplus1; ++v ) {
                for ( let u = u_degree; u < u_nplus1; ++u ) {
                    // calculate the bsplineweights * points * pointweights
                    let sum_x = 0, sum_y = 0, sum_z = 0, nw_sum = 0, jc = 0;
                    for ( let j = v - v_degree; j <= v; ++j, ++jc ) {
                        let kc = 0;
                        for ( let k = u - u_degree; k <= u; ++k, ++kc ) {
                            let nw = nurbs_weight(j, v_U[v], v_degree, v_U) * nurbs_weight(k, u_U[u], u_degree, u_U) * w_arr[u_nplus1 * j + k];
                            nw_sum += nw;
                            sum_x += nw * points[(u_nplus1 * j + k) * 3];
                            sum_y += nw * points[(u_nplus1 * j + k) * 3 + 1];
                            sum_z += nw * points[(u_nplus1 * j + k) * 3 + 2];
                        }
                    }
                    if ( nw_sum > 0 ) {
                        let nurbs_div = 1 / nw_sum;
                        point(sum_x * nurbs_div, sum_y * nurbs_div, sum_z * nurbs_div);
                    }
                }
            }
        }
        
        if(drawcp){
            // draw controllpoints
            // console.log('w', width, 'h', height);
            stroke(50, 255, 50);
            scp_arr = [];
            for (var i = 0; i < points.length; i += 3) {
                if ( pointsize_arr[i / 3] != 0 ) {
                    strokeWeight(20 * pointsize_arr[i / 3]);
                    point(points[i], points[i+1], points[i+2]);
                    let fg = screenPosition(points[i], points[i + 1], points[i + 2]);
                    scp_arr.push(fg.x + width / 2, fg.y + height / 2);
                    // console.log('fg', fg.x + width / 2, fg.y + height / 2);
                }
            }
        }
        drawed = true;
    }
}

function distance(px, py, mx, my) {
    let dx = px - mx,
        dy = py - my;
    return dx * dx + dy * dy;
}

function mouseMoved() {
    if ( mouseX <= mousexmax && mouseY > mouseymin ) {
        let zz = 0;
        for ( var i = 0; i < points.length; i += 3, ++zz ) {
            // let fg = screenPosition(points[i], points[i + 1], points[i + 2]);
            // console.log('fg', fg.x, fg.y);
            if ( distance(scp_arr[zz * 2], scp_arr[zz * 2 + 1], mouseX, mouseY) <= 100 ) {
                if ( on_point != i / 3 && notPopup ) {
                    on_point = i / 3;
                    let mp = document.getElementById("myPopup");
                    mp.style.left = (mouseX - mp.offsetWidth / 2) + 'px';
                    mp.style.top = mouseY + 'px';
                    mp.classList.add("show");
                    notPopup = false;
                }
                break;
            }
        }
    }
}

function mousePressed() {
    // console.log(mouseX, mouseY);
}

function keyWatch() {
    // down arrow
    if ( keyIsDown(40) ) {
        // cam.move(0, -height / 4, 0);
        szog1 -= PI / 18;
        // console.log(szog1);
        if ( szog1 < -PI / 2 ) {
            szog1 = -PI / 2;
        }
        // cam.lookAt(0,0,0);
        drawed = false;
    }
    // up arrow
    if ( keyIsDown(38) ) {
        // cam.move(0, height / 4, 0);
        szog1 += PI / 18;
        // console.log(szog1);
        if ( szog1 > PI / 2 ) {
            szog1 = PI / 2;
        }
        // cam.lookAt(0,0,0);
        drawed = false;
    }
    // right arrow
    if ( keyIsDown(39) ) {
        // cam.move(width / 4, 0, 0);
        szog2 -= PI / 18;
        // cam.lookAt(0,0,0);
        drawed = false;
    }
    // left arrow
    if ( keyIsDown(37) ) {
        // cam.move(-width / 4, 0, 0);
        szog2 += PI / 18;
        // cam.lookAt(0,0,0);
        drawed = false;
    }
    // zoom in with key j
    if ( keyIsDown(74) ) {
        // cam.move(0, 0, -height / 10);
        sugar *= 0.9;
        // cam.lookAt(0,0,0);
        drawed = false;
    }
    // zoom out with key f
    if ( keyIsDown(70) ) {
        // cam.move(0, 0, height / 10);
        sugar *= 1.1;
        // cam.lookAt(0,0,0);
        drawed = false;
    }
}
