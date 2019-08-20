import {RemotePlugin} from '../remotePluginApi';

function updateLink($link: HTMLLinkElement) {
	const newLink = $link.cloneNode() as HTMLLinkElement;
	newLink.onload = function () {
		$link.remove();
	};

	newLink.href = $link.href.split('?')[0] + '?' + Date.now();
	$link.parentNode!.insertBefore(newLink, $link.nextSibling);
}

export const updateCss: RemotePlugin = api => {
	api.webSocket.onMessage('updateCss', () => {
		const $$links = document.querySelectorAll('link[rel="stylesheet"]');
		$$links.forEach(updateLink);
	});
};
