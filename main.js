window.onload = init;

// 澳大利亚城市样式
const aussieCitiesStyle = function (feature) {
  let cityID = feature.get("ID");
  let cityIDString = cityID.toString();
  const style = [
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: [77, 219, 34, 1],
        }),
        stroke: new ol.style.Stroke({
          color: [6, 125, 34, 1],
          width: 2,
        }),
        radius: 12,
      }),
      text: new ol.style.Text({
        text: cityIDString,
        fill: new ol.style.Fill({
          color: [232, 26, 26, 1],
        }),
        stroke: new ol.style.Stroke({
          color: [232, 26, 26, 1],
          width: 2,
        }),
      }),
    }),
  ];
  return style;
};

// 澳大利亚城市GeoJSON
const austCitiesLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "./data/aust_cities.geojson",
    format: new ol.format.GeoJSON(),
  }),
  style: aussieCitiesStyle,
});

// 选择样式
const styleForSelect = function (feature) {
  let cityID = feature.get("ID");
  let cityIDString = cityID.toString();
  const style = [
    new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: [247, 26, 10, 0.5],
        }),
        stroke: new ol.style.Stroke({
          color: [6, 125, 34, 1],
          width: 2,
        }),
        radius: 12,
      }),
      text: new ol.style.Text({
        text: cityIDString,
        fill: new ol.style.Fill({
          color: [87, 9, 9, 1],
        }),
        stroke: new ol.style.Stroke({
          color: [87, 9, 9, 1],
          width: 0.5,
        }),
      }),
    }),
  ];
  return style;
};

function init() {
  const austrCenterCoordinate = [15091875.539375868, -2890099.0297847847];

  const map = new ol.Map({
    view: new ol.View({
      center: austrCenterCoordinate,
      zoom: 1,
      extent: [
        11644482.371265175, -5927677.981920381, 17897308.66780227,
        423055.8371644793,
      ],
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    target: "openlayers-map",
  });

  map.addLayer(austCitiesLayer);

  // 要素点击逻辑
  const navElements = document.querySelector(".column-navigation");
  const cityNameElement = document.getElementById("cityname");
  const cityImageElement = document.getElementById("cityimage");
  const mapView = map.getView();

  //单击事件
  map.on("click", function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      let featureName = feature.get("Cityname");
      let navElement = navElements.children.namedItem(featureName);
      mainLogic(feature, navElement);
    });
  });

  // 主要逻辑
  function mainLogic(feature, clickedAnchorElement) {
    let currentActivaeStyledElement = document.querySelector(".active");
    currentActivaeStyledElement.className =
      currentActivaeStyledElement.className.replace("active", "");
    clickedAnchorElement.className = "active";

    let aussieCitiesFeatures = austCitiesLayer.getSource().getFeatures();
    aussieCitiesFeatures.forEach(function (feature) {
      feature.setStyle(aussieCitiesStyle);
    });

    if (clickedAnchorElement.id === "Home") {
      mapView.animate({ center: austrCenterCoordinate, zoom: 4 });
      cityNameElement.innerHTML = "欢迎来到澳大利亚旅游地图";
      cityImageElement.src = `./data/City_images/Australian_Flag.jpg`;
    } else {
      feature.setStyle(styleForSelect);
      // 基于要素改变视图
      let featureCoordinates = feature.getGeometry().getCoordinates();
      mapView.animate({
        center: featureCoordinates,
        zoom: 5,
      });
      let featureName = feature.get("Cityname");
      let featureImage = feature.get("Cityimage");
      cityNameElement.innerHTML = "Name of the city" + featureName;
      cityImageElement.src = `./data/City_images/${featureImage}.jpg`;
    }
  }

  // 导航按钮逻辑
  const anchorNavElements = document.querySelectorAll(".column-navigation>a");
  for (let anchorNavElement of anchorNavElements) {
    anchorNavElement.addEventListener("click", function (e) {
      let clickedAnchorElement = e.target;
      let clickedAnchorElementID = clickedAnchorElement.id;
      let aussieCitiesFeatures = austCitiesLayer.getSource().getFeatures();
      aussieCitiesFeatures.forEach(function (feature) {
        let featureName = feature.get("Cityname");
        if (clickedAnchorElementID === featureName) {
          mainLogic(feature, clickedAnchorElement);
        }
      });

      if (clickedAnchorElementID === "Home") {
        mainLogic(undefined, clickedAnchorElement);
      }
    });
  }

  // 指针停留
  const popoverTextElement = document.getElementById("popover-text");
  const popoverTextLayer = new ol.Overlay({
    element: popoverTextElement,
    positioning: "bottom-center",
    stopEvent: false,
  });
  map.addOverlay(popoverTextLayer);
  map.on("pointermove", function (evt) {
    let isFeatureAtPixel = map.hasFeatureAtPixel(evt.pixel);
    if (isFeatureAtPixel) {
      let featureAtPixel = map.getFeaturesAtPixel(evt.pixel);
      let featureName = featureAtPixel[0].get("Cityname");
      popoverTextLayer.setPosition(evt.coordinate);
      popoverTextElement.innerHTML = featureName;
      map.getViewport().style.cursor = "pointer";
    } else {
      popoverTextLayer.setPosition(undefined);
      map.getViewport().style.cursor = "";
    }
  });
}
