
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
	GetMeanAnomlayFromEccentricity(ecan, ecc)
	{
		 var mean = ecan - ecc * Math.sin(ecan);
     return mean;
	},

	GetEccentricAnomlayFromTrueAnomaly(eccentricity, true_anomaly)
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
	GetEccentricAnomlayFromMeanMotion(mean, ecc)
	{
		var E1=0, E2=0; // initial estimate, improved estimate
		var tol = 1.0E-9; // maximum difference allowed
		var count = 0;
		E2 = mean;

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

       var ecan = E2;
       return ecan;
	},
	GetTrueAnomalyFromEccentricAnomaly(ecan, ecc)
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
	ReturnStateVectorWithTimeStep(timeStep, posonly=false)
	{
		// console.log(this.a, this.GM, this.OMEG, this.e, this.i, this.mu)
		var EGM96_mu = 3.986004415E14;
		var twoPi = (2*Math.PI);

		//the mean motion
		var n = Math.sqrt(this.GM/(this.a)/this.a);
		if (this.e == 0) {this.e = 0.0001}

		//var ecan = eccentricAnomaly(M, this.e, 1E-6, 20, twoPi)
		var ecan = this.GetEccentricAnomlayFromTrueAnomaly(this.e, this.nu);

		// mean anomaly for time zero and time step
		var M0 = this.GetMeanAnomlayFromEccentricity(ecan, this.e);
		var MT = M0 + (n * timeStep);

		var ecan_t  = this.GetEccentricAnomlayFromMeanMotion(MT, this.e);

		var tran_t = this.GetTrueAnomalyFromEccentricAnomaly(ecan_t, this.e);

		var p = this.a*(1 - this.e*this.e)
		var r = p/(1 + this.e*Math.cos(tran_t))
		var h = Math.sqrt(this.GM*p), ci = Math.cos(this.i), si = Math.sin(this.i), cr = Math.cos(this.OMEG),
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
	CalculateEccentricAnomaly(mean, ecc, tol, maxIter, twoPi)
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
