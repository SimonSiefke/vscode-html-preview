import {activateExtension} from '../../../test-util';
import * as puppeteer from 'puppeteer';
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';

const headless = false;

function getBrowser() {
	return puppeteer.launch({headless, args: ['--no-sandbox']});
}

function getUri(file) {
	return vscode.Uri.file(
		path.join(__dirname, 'with-external-assets-workspace-dist', file).replace('dist', 'src')
	);
}

test('external assets load correctly', async () => {
	await activateExtension();
	const uri = getUri('index.html');
	const document = await vscode.workspace.openTextDocument(uri);
	const text = document.getText();
	vscode.window.showTextDocument(document);
	const browser = await getBrowser();
	const page = await browser.newPage();
	await vscode.commands.executeCommand('htmlPreview.openPreview');
	await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'});
	await page.evaluate(() => {
		// @ts-ignore
		const $h1 = document.querySelector('h1');
		// @ts-ignore
		const color = window.getComputedStyle($h1).getPropertyValue('color');
		// @ts-ignore
		if (color !== 'rgb(102, 51, 153)') {
			throw new Error(`style did not load correctly, was ${color}, expected rgb(102, 51, 153) `);
		}

		// @ts-ignore
		const hasCustomFont = document.fonts.check('1em BilboSwashCaps');
		if (!hasCustomFont) {
			throw new Error('font did not load');
		}

		// @ts-ignore
		const hasOtherFont = document.fonts.check('1em BilboSwashCaps2');
		if (hasOtherFont) {
			throw new Error('font should not exist');
		}

		function IsImageOk($img) {
			return $img.naturalWidth !== 0;
		}

		// @ts-ignore
		const $images = Array.from(document.querySelectorAll('img'));
		for (const $image of $images) {
			// @ts-ignore
			const shouldBeOk = !$image.hasAttribute('data-invalid');
			if (!shouldBeOk && IsImageOk($image)) {
				throw new Error('image is ok');
			} else if (shouldBeOk && !IsImageOk($image)) {
				// @ts-ignore
				throw new Error(`image with src ${$image.src} is not ok`);
			}
		}
	});
	await browser.close();
});
