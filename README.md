# Toscana Grill — estructura con JSON

## Estructura

```text
index.html
data/
  config.json
  menu.json
css/
  styles.css
  configuracion.css
js/
  app.js
  config-editor.js
assets/
  fondo-toscana.png
admin/
  configuracion.html
```

## Archivos editables

- `data/config.json`: horarios, WhatsApp, delivery y desechables.
- `data/menu.json`: productos, categorías, descripciones y precios.

## Configuración visual

Abra:

`admin/configuracion.html`

Después pulse **Descargar config.json** y reemplace:

`data/config.json`

## Imagen de cabecera

La imagen utilizada es `assets/fondo-toscana.png`, correspondiente a la última imagen generada sin letras.

En `css/styles.css` se mantiene:

```css
background-size: 100% 100%;
```

Esto fuerza a la imagen a ocupar todo el ancho y alto de la cabecera. Puede deformarse ligeramente en pantallas con proporciones distintas. Para conservar proporciones, cambie a `cover`.

## Publicación

Los archivos JSON se cargan con `fetch`, por lo que deben probarse desde GitHub Pages o mediante un servidor local. Abrir `index.html` directamente con doble clic puede impedir la carga por restricciones del navegador.

## Seguridad

Los archivos JSON son públicos porque el navegador necesita leerlos. No deben contener contraseñas, tokens, claves API ni información sensible.
