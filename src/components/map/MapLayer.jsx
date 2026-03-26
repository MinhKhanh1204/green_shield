import React, { memo, useMemo } from 'react';
import { TileLayer } from 'react-leaflet';
import { MAP_STYLES } from './mapTheme';

function MapLayer({ mapStyle }) {
  const tileConfig = useMemo(() => MAP_STYLES[mapStyle] || MAP_STYLES.light, [mapStyle]);

  return <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />;
}

export default memo(MapLayer);
