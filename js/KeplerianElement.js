
// author: Zhen Li
// email: hpulizhen@163.com

// start class KeplerianElement

function KeplerianElement()
{
	this.a = 0.0; // semi-major axis
	this.e = 0.0; // eccentricity
	this.i = 0.0; // inclination
	this.OMEG = 0.0; // RAAN, Right Ascension of ascending node
	this.nu = 0.0; // true anomaly
	this.mu = 0.0; // argument of perigee
	this.GM = 398600.4415;  // km
}

KeplerianElement.prototype =
{
	constructor: KeplerianElement,
	setElements: function(sma,ecc, inc, omeg, mu, nu)
	{
		this.a = sma;
		this.e = ecc;
		this.i = inc;
		this.OMEG = omeg;
		this.nu = nu;
		this.mu = mu;
	},

	get_mean_from_ecan(ecan, ecc)
	{
		 var mean = ecan - ecc * Math.sin(ecan);
     return mean;
	},


	// get ecan from true anomaly
	get_ecan_from_tran(eccentricity, true_anomaly)
	{
		var sin_ecan, cos_ecan;
        var twopi = Math.PI*2.0;
        // Not named correctly, these are both missing a division by (1 + ecc*cos(tran))
        sin_ecan = Math.sqrt(1.0 - eccentricity * eccentricity) * Math.sin(true_anomaly);
        cos_ecan = Math.cos(true_anomaly) + eccentricity;

        // But we don't do the division as it will cancel out in here anyway
        var ecan = Math.atan2(sin_ecan, cos_ecan);

        if ( ecan < 0.0)
        {
            ecan += twopi; // Bring E into range 0 to 2PI
        }
        return ecan;
	},


	// get eccentric anomaly from mean motion
	get_ecan_from_mean(mean, ecc)
	{
		var E1=0, E2=0; // initial estimate, improved estimate

    var tol = 1.0E-9; // maximum difference allowed
	var count = 0;
     E2 = mean;

	 /// These code might not get convergent!!!!!
    //  if ((Math.abs(mean) < 0.7) ||
    //       (Math.abs(mean) > 5.6)) // if M < 40 degrees or M > 320 degrees


    //  {
    //         //apply Newton's method
    //         do
    //         {
    //             E1 = E2;
    //             E2 = E1 -
    //             (E1 - ecc * Math.sin(E1) - mean) / (1.0 - ecc * Math.cos(E1));
    //         } while ( Math.abs(E1 - E2) > tol); // end of loop for Newton's method
    //  }

    //  else
     {
            //apply fixed point iteration
			while(1)
			{
				E1 = E2;
				E2 = mean + ecc * Math.sin(E1);
				count = count+1;
				
				if(Math.abs(E1 - E2) < tol)
				{
					break;
				}

				if(count >3)
				{
					break;
				}

			}
			
			// do
            // {
            //     E1 = E2;
			// 	E2 = mean + ecc * Math.sin(E1);
			// 	count = count+1;
			// } 
			// while ( (Math.abs(E1 - E2) > tol)|| count < 3); // end of loop for fixed point iteration
     }

       var ecan = E2;
       return ecan;
	},


	get_tran_from_ecan(ecan, ecc)
	{
		var sin_tran, cos_tran;

        // Not named correctly, these are both missing a division by (1 - ecc*cos(ecan))
     sin_tran = Math.sqrt(1.0 - ecc * ecc) * Math.sin(ecan);
     cos_tran = Math.cos(ecan) - ecc;

        // But we don't do the division as it will cancel out in here anyway
     var tran = Math.atan2(sin_tran, cos_tran);

     if (tran < 0.0)
     {
        var twopi = 2.0*Math.PI;
        tran += twopi; // Bring E into range 0 to 2PI
     }

     return tran;
	},


	// update the true anomaly at time t since reference time t0
	updateElements(t)
	{
     //the mean motion
     var n = Math.sqrt(this.GM/this.a)/ this.a;
    
	 //eccentric anomaly
     var ecan_t0 = this.get_ecan_from_tran(this.e, this.nu);

     // the mean anomaly at t0
     var M0 = this.get_mean_from_ecan(ecan_t0,this.e);

	 var Mt = M0 + n*t;
		
	//because eccentricity is fixed
     var ecan_t  = this.get_ecan_from_mean(Mt, this.e);

     var tran_t = this.get_tran_from_ecan(ecan_t, this.e);

	//update the true anomaly
	this.nu = tran_t;

	},

	//from monbenbruck's code
	getStateVector1()
	{
		// eccentric anomaly
		var E = this.get_ecan_from_tran(this.e, this.nu);
		var cosE = Math.cos(E);
  		var sinE = Math.sin(E);

  		// Perifocal coordinates
		var fac = Math.sqrt ( (1.0-this.e)*(1.0+this.e) );
		var R = this.a*(1.0-this.e*cosE);  // Distance
  		var V = Math.sqrt(this.GM*this.a)/R;    // Velocity

		var r = new THREE.Vector3(this.a*(cosE-this.e), this.a*fac*sinE, 0.0);
		var v = new THREE.Vector3(-V*sinE,+V*fac*cosE,0.0);

		var tm1 = new THREE.Matrix4();
		tm1.makeRotationX(-this.i);

		var tm2 = new THREE.Matrix4();
		tm2.makeRotationZ(-this.OMEG);

		var tm3 = new THREE.Matrix4();
		tm3.makeRotationZ(-this.mu);

		tm2.multiply(tm1);
		tm2.multiply(tm3);

		// Transformation to reference system (Gaussian vectors)
		r.applyMatrix4(tm2);
		v.applyMatrix4(tm2);
		//PQW = R_z(-Omega) * R_x(-i) * R_z(-omega);

		//r = PQW*r;
		//v = PQW*v;

		var pos_vel = new Array(6);
		pos_vel[0] = r.x;pos_vel[1] = r.y;pos_vel[2] = r.z;
		pos_vel[3] = v.x;pos_vel[4] = v.y;pos_vel[5] = v.z;

  		// State vector
		return pos_vel;

	},

	getStateVector()
	{
		// state vector, position and velocity
		var pos_vel = new Array(6);

		var sqrt1me2 = Math.sqrt(1.0 - this.e * this.e);
		var ecan = this.get_ecan_from_tran(this.e, this.nu);
		var cos_ecan = Math.cos(ecan);
    	var sin_ecan = Math.sin(ecan);

        // Compute the magnitude of the Gaussian vectors at the required point
		var gaussX = this.a * (cos_ecan - this.e);    // Magnitude of
		var gaussY = this.a * sqrt1me2 * sin_ecan; // Gaussian vectors

		var XYdotcommon = Math.sqrt(this.GM / this.a) / (1.0 - this.e * cos_ecan);


		var gaussXdot = -sin_ecan * XYdotcommon;           // Gaussian vel.
		var gaussYdot = cos_ecan * sqrt1me2 * XYdotcommon; // components

		var cos_inc = Math.cos(this.i);
		var sin_inc = Math.sin(this.i);

		var cos_argp = Math.cos(this.mu);
		var cos_raan = Math.cos(this.OMEG);

		var sin_argp = Math.sin(this.mu);
		var sin_raan = Math.sin(this.OMEG);

		var cc = cos_argp * cos_raan;
		var cs = cos_argp * sin_raan;
		var sc = sin_argp * cos_raan;
		var ss = sin_argp * sin_raan;

		var P = new Array(3);
		var Q = new Array(3);
		P[0] = cc - ss * cos_inc;
		P[1] = cs + sc * cos_inc;
		P[2] = sin_argp * sin_inc;

		Q[0] = -sc - cs * cos_inc;
		Q[1] = -ss + cc * cos_inc;
		Q[2] = cos_argp * sin_inc;


		pos_vel[0] = gaussX * P[0] + gaussY * Q[0];
		pos_vel[1] = gaussX * P[1] + gaussY * Q[1];
		pos_vel[2] = gaussX * P[2] + gaussY * Q[2];

		pos_vel[3] = gaussXdot * P[0] + gaussYdot * Q[0];
		pos_vel[4] = gaussXdot * P[1] + gaussYdot * Q[1];
		pos_vel[5] = gaussXdot * P[2] + gaussYdot * Q[2];

		return pos_vel;
	},

	ReturnStateVectorWithTimeStep(timeStep, posonly=false)
	{
		// console.log(this.a, this.GM, this.OMEG, this.e, this.i, this.mu)
		var EGM96_mu = 3.986004415E14;
		var twoPi = (2*Math.PI);

		//the mean motion
		var n = Math.sqrt(this.GM/(this.a)/this.a);
		if (this.e == 0) {this.e = 0.0001}

		// mean anomaly
		var ecan = eccentricAnomaly(M, this.e, 1E-6, 20, twoPi)

		// mean anomaly for time zero and time step
		var M0 = this.get_mean_from_ecan(ecan,this.e);
		var MT = M0 + (n * timeStep);

		var ecan_t  = this.get_ecan_from_mean(MT, this.e);

		// var tran = 2*Math.atan2(Math.sqrt((1+this.e)/(1-this.e))*Math.sin(ecan/2), Math.cos(ecan/2))
		var tran_t = this.get_tran_from_ecan(ecan_t, this.e);

		var p = this.semi_major_axis*(1 - this.e*this.e)
		var r = p/(1 + this.e*Math.cos(tran_t))
		var h = Math.sqrt(EGM96_mu*p), ci = Math.cos(this.i), si = Math.sin(this.i), cr = Math.cos(this.OMEG),
		sr = Math.sin(this.OMEG), cw = Math.cos(this.mu + tran_t), sw = Math.sin(this.mu + tran_t)

		var pos = new Cesium.Cartesian3(cr*cw-sr*sw*ci, sr*cw+cr*sw*ci, si*sw), pos2 = new Cesium.Cartesian3()
		Cesium.Cartesian3.multiplyByScalar(pos, r, pos2)
		if (posonly)
		return(pos2)


		var vel = new Cesium.Cartesian3(), vel1 = new Cesium.Cartesian3(), vel2 = new Cesium.Cartesian3()
		Cesium.Cartesian3.subtract(Cesium.Cartesian3.multiplyByScalar(pos2, h*this.e*Math.sin(tran_t)/(r*p), vel1),
					Cesium.Cartesian3.multiplyByScalar(new Cesium.Cartesian3(cr*sw+sr*cw*ci, sr*sw-cr*cw*ci,-si*cw),h/r,vel2),vel)
		return({pos: pos2, vel: vel})
	},

	eccentricAnomaly(mean, ecc, tol, maxIter, twoPi)
	{
		var i, curr, prev = mean
		for (i = 1; i <= maxIter; i++)
		{
			curr = prev - (prev - ecc*Math.sin(prev) - mean)/(1 - ecc*Math.cos(prev))
			if (Math.abs(curr - prev) <= tol)
				return(curr % twoPi)
			prev = curr
		}
		return(NaN)
	}
};
