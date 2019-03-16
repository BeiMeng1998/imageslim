# `imageslim`

[![npm](https://img.shields.io/npm/v/imageslim.svg?style=flat-square)](https://npmjs.org/imageslim)
Elegant terminal spinner

## Install

With `npm`:

```
npm install imageslim -g
```


## Usage

```
imageslim [option] [in_file]
```
Compressed images will be recorded in`.imageslimrc` files and will not be compressed repeatedly.


## Example
```
/* Compress all images in the current directory and overwrite the original file */
imageslim 		

/* Compress all pictures in the specified directory and overwrite the original file */
imageslim images

/* Support for generating webp format pictures  */
imageslim images -w

/* Force compression of images even though they have already been compressed */
imageslim images -f
```
