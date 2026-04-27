// ==UserScript==
// @name         BloggerComment
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tampering Blogger Comment pages
// @author       Thawmtowm
// @match        https://www.blogger.com/comment/*
// @include      https://www.blogger.com/comment/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=blogger.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';
    function init() {
        const bbCodeTextArea = document.querySelector('textarea[data-initial-value]');

        if (!bbCodeTextArea) return false; // bbCodeTextArea isn't there yet

        const replyContainerWidth = bbCodeTextArea.parentElement?.parentElement?.parentElement?.parentElement;
        const replyContainerHeight = bbCodeTextArea.parentElement?.parentElement?.parentElement;
        const replyContainerLabel = bbCodeTextArea.parentElement?.parentElement?.firstChild;

        if (replyContainerWidth) {
            Object.assign(replyContainerWidth.style, { width: '90%' });
            Object.assign(replyContainerHeight.style, { height: '180px', maxHeight: 'unset' });
            Object.assign(replyContainerLabel.style, { display: 'none' });
            Object.assign(bbCodeTextArea.style, { minHeight: '150px', maxHeight: '150px' });
        }

        window.addEventListener("message", (e) => {
            const bbCodeTextArea = document.querySelector('textarea[data-initial-value]');
            if (!bbCodeTextArea || e.origin !== "https://an-hoang-trung-tuong-2014.blogspot.com") return;

            if (e.data.action === "AHTT_SEND_TEXT_TO_BLG") {
                const messageText = decodeURIComponent(e.data.text);
                const len = messageText.length;
                bbCodeTextArea.value = messageText;
                bbCodeTextArea.focus();
                bbCodeTextArea.setSelectionRange(len, len);
            }
        }, false);

        return true; // Successfully initialized
    }

    // Observer to watch for DOM changes if element isn't there yet
    const observer = new MutationObserver(() => {
        if (init()) {
            observer.disconnect(); // Stop looking after init runs
        }
    });

    window.addEventListener('load', () => {
        if (!init()) {
            // Start observing if init failed on load (bbCodeTextArea isn't there yet)
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }, { once: true });

})();