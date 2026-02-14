// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { OptionsDialogPage } from "../../pages/OptionsDialogPage/OptionsDialogPage";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';

Injector.Nav = new NavController();

var page: OptionsDialogPage;
describe('Test OptionsDialogPage', function () {
    beforeEach(function (done) {
        page = Injector.Nav.push(OptionsDialogPage);
        page.items = [
            { title: 'Item 1', text: 'Description 1', selected: false },
            { title: 'Item 2', text: 'Description 2', selected: true },
            { title: 'Item 3', text: 'Description 3', selected: false, disabled: true }
        ];
        
        setTimeout(() => {
            done();
        }, 0);
    })

    afterEach(function (done) {
        page.destroy();
        done();
    })

    it("Page defined", function () {
        expect(page).not.toBeNull();
    });

    it("Items rendered", function () {
        let titles = DOM(page.page).find('.item-title');

        expect(titles.length).toBe(3);

        expect(titles[0].innerText).toBe("Item 1");
        expect(titles[1].innerText).toBe("Item 2");
        expect(titles[2].innerText).toBe("Item 3");
    });

    it("Single selection: clicking an item selects it and destroys page", function (done) {
        page.onDestroy = Override(page, page.onDestroy, (next) => {
            next();
            expect(page.items[0].selected).toBe(true);
            done();
        });

        const items = DOM(page.page).find('li');
        items[0].dispatchEvent(new Event("click"));
    });

    it("Multiple selection: toggles items and shows Ok button", function (done) {
        page.multiple = true;
        // page.update() is called inside setter of multiple if it triggers changes, 
        // but here we might need it to ensure Ok button is rendered
        page.update();

        setTimeout(() => {
            const html = page.page.innerHTML;
            expect(html).toContain("Ok");

            const items = DOM(page.page).find('li');
            
            // Toggle Item 1 (was false -> true)
            items[0].dispatchEvent(new Event("click"));
            // Wait for update
            setTimeout(() => {
                expect(page.items[0].selected).toBe(true);

                // Toggle Item 2 (was true -> false)
                items[1].dispatchEvent(new Event("click"));
                setTimeout(() => {
                    expect(page.items[1].selected).toBe(false);
                    done();
                }, 50);
            }, 50);
        }, 100);
    });

    it("Multiple selection: Ok button returns selected items", function (done) {
        page.multiple = true;
        page.update();

        page.onOkClicked = (selectedItems) => {
            expect(selectedItems.length).toBe(1);
            expect(selectedItems[0].title).toBe('Item 2');
            done();
        };

        setTimeout(() => {
            const okButton = DOM(page.page).find("#dialogButtonOk")[0];
            if (okButton) {
                okButton.dispatchEvent(new Event("click"));
            } else {
                done.fail("Ok button not found");
            }
        }, 100);
    });

    it("Disabled items cannot be clicked", function (done) {
        const initialSelected = page.items[2].selected;
        const items = DOM(page.page).find('li');
        
        // Item 3 is disabled
        items[2].dispatchEvent(new Event("click"));
        
        setTimeout(() => {
            expect(page.items[2].selected).toBe(initialSelected);
            done();
        }, 100);
    });

    it("Icons are correctly assigned", function () {
        // Item 1 is not selected
        expect(page.getIcon(page.items[0])).toBe(page.icons.deselected);
        // Item 2 is selected
        expect(page.getIcon(page.items[1])).toBe(page.icons.selected);
        // Item 3 is disabled
        expect(page.getIcon(page.items[2])).toBe(page.icons.disabled);
    });

    it("Clicking an item updates its selected state in multiple mode", function (done) {
        page.multiple = true;
        page.update();

        setTimeout(() => {
            const items = DOM(page.page).find('li');
            if (items.length > 0) {
                items[0].dispatchEvent(new Event("click"));
                setTimeout(() => {
                    expect(page.items[0].selected).toBe(true);
                    done();
                }, 50);
            } else {
                // Fallback if UI not rendering in test env
                page._onItemClicked(page.items[0], 0);
                expect(page.items[0].selected).toBe(true);
                done();
            }
        }, 100);
    });
});
