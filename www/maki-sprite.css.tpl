.maki-icon {
  background-image: url({{spritesheet.image}});
  background-position: 24px 24px;
  background-repeat: no-repeat;
  width: 24px;
  height: 24px;
  overflow:hidden;
  text-indent:-9999px;
}

.dark .maki-icon { background-image: url({{darkpath spritesheet.image}}); }

.title-box .maki-icon.full {
  width: 54px;
  display: block;
  left: 0;
  right: 0;
  margin: auto;
}

@media
only screen and (-webkit-min-device-pixel-ratio : 2),
only screen and (min-device-pixel-ratio : 2) {
  .maki-icon {
    background-image: url({{retina_spritesheet.image}});
    background-size: {{spritesheet.px.width}} {{spritesheet.px.height}}; 
  }
  .dark .maki-icon { background-image:url({{darkpath retina_spritesheet.image}}); }
}

{{#sprites}}
.maki-icon.{{name}} { background-position: {{px.offset_x}} {{px.offset_y}}; }
{{/sprites}}
