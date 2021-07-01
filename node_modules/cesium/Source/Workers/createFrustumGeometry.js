/* This file is automatically rebuilt by the Cesium build process. */
define(['./when-f31b6bd1', './FrustumGeometry-984f57e7', './Transforms-8cafde1e', './Cartesian2-29c15ffd', './Check-ed9ffed2', './Math-03750a0b', './RuntimeError-c7c236f3', './ComponentDatatype-2ec73936', './WebGLConstants-34c08bc0', './GeometryAttribute-d59971e1', './GeometryAttributes-e973821e', './Plane-6b4433f9', './VertexFormat-44d61ac9'], function (when, FrustumGeometry, Transforms, Cartesian2, Check, _Math, RuntimeError, ComponentDatatype, WebGLConstants, GeometryAttribute, GeometryAttributes, Plane, VertexFormat) { 'use strict';

  function createFrustumGeometry(frustumGeometry, offset) {
    if (when.defined(offset)) {
      frustumGeometry = FrustumGeometry.FrustumGeometry.unpack(frustumGeometry, offset);
    }
    return FrustumGeometry.FrustumGeometry.createGeometry(frustumGeometry);
  }

  return createFrustumGeometry;

});
