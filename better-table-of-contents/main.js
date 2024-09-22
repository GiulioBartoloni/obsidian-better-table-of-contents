const { Plugin } = require('obsidian');

class FolderListPlugin extends Plugin {
    async onload() {    //loading the new command
        this.addCommand({
            id: 'better-table-of-contents',
            name: 'Create Table of Contents from current folder',
            callback: () => this.appendBetterToC(),
        });
    }

    async appendBetterToC() {       
        const activeFile = this.app.workspace.getActiveFile();  //current active file
        if (!activeFile) 
            return;

        const folderPath = activeFile.parent.path; //current path is saved
        const files = this.app.vault.getFiles().filter(file => file.parent.path === folderPath && file.path !== activeFile.path) //the files array is saved 

        files.sort((a, b) => a.basename.localeCompare(b.basename)); //files are sorted alphabetically

        for (let file of files) {
            const fileContent = await this.app.vault.read(file);
            const headers = this.extractHeaders(fileContent);

            await this.app.vault.append(activeFile, `- [[${file.basename}]]\n`);    //files are printed as links

            for(const header of headers)
                await this.app.vault.append(activeFile, `${'  '.repeat(header.level)}- [[${file.basename}#${header.title}#|${header.title}]]\n`);
                
        }
    }

    extractHeaders(fileContent){
        const headers = [];
        const headerExtractionRegex = /^(#+)\s*(.+)$/gm;
        let matches;
    
        while((matches = headerExtractionRegex.exec(fileContent)) !== null){
            const level = matches[1].length;
            const title = matches[2].trim();
            headers.push({level,title});
        }

        while (headers.length>0 && headers.every(elem => elem.level > 1)) 
            headers.forEach(elem => {elem.level -= 1;});

        return headers;
    }
}



module.exports = FolderListPlugin;