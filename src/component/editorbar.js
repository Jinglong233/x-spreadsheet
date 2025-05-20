/* global window */
import {h} from './element';
import {bind} from './event';
import Dropdown from './dropdown';
import {cssPrefix} from '../config';
import {t} from '../locale/locale';


export default class EditorBar {
    constructor(data, sheet) {
        this.label = h('div', `${cssPrefix}-editorlabel`);
        this.label.html('A1')
        this.textarea = h('textarea', `${cssPrefix}-editorbartextarea`);
        this.textarea.html('')
        this.sheet = sheet;
        this.currentCell = {ri: 0, ci: 0};
        this.el = h('div', `${cssPrefix}-editorbar`).children(this.label.el, this.textarea.el);
        this.textarea.on('input', (evt) => {
            const text = evt.target.value;
            this.handleFormulaChange(text);
        });
        if (sheet) {
            this.bindEvents(sheet);
        }
    }

    /**
     * 将数字列索引转换为字母（0 => A, 26 => AA）
     * @param ci 列索引（从0开始）
     */
    getColumnLetter(ci) {
        let temp = ci + 1; // 转换为1-based
        let letter = '';
        while (temp > 0) {
            const remainder = (temp - 1) % 26;
            letter = String.fromCharCode(65 + remainder) + letter;
            temp = Math.floor((temp - 1) / 26);
        }
        return letter;
    };

    /**
     * 获取当前选中区域的A1格式范围
     */
    getSelectedA1Range(ri, ci) {
        const col = this.getColumnLetter(ci);
        const row = ri + 1; // 转换为1-based
        return `${col}${row}`;
    };

    bindEvents(sheet) {
        this.sheet = sheet;
        sheet.on('cell-selected', (cell, ri, ci) => {
            this.currentCell.ci = ci;
            this.currentCell.ri = ri;
            this.label.html(this.getSelectedA1Range(ri, ci));
            this.updateFormulaBa();
        });
        sheet.on('cell-edited', (text, ri, ci) => {
            this.updateFormulaBa()
        });
    }

    updateFormulaBa() {
        if (!this.sheet || !this.textarea) return;
        const cellVal = this.sheet.data.getCellTextOrDefault(this.currentCell.ri, this.currentCell.ci);
        this.textarea.val(cellVal);
        this.sheet.table.render();
    };

    handleFormulaChange(text) {
        if (!this.sheet || !this.textarea) return;
        this.sheet.data.setCellText(this.currentCell.ri, this.currentCell.ci, text);
        this.sheet.table.render();
    };
}



