import requests
import string, os, random, re, argparse
from time import perf_counter
from concurrent.futures import ThreadPoolExecutor
import urllib.parse as urlparse
import tqdm
requests.packages.urllib3.disable_warnings()  

class downloader:
    def __init__(self, url, out=None, directory=None, render=True):
        self.url = url
        self.out = out
        self.dir = directory
        self.render = render
        directory and not os.path.exists(directory) and os.makedirs(directory)
        self.headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) \
            AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.63 Safari/537.36"}

    def make_request(self):
        try:
            self.res = requests.get(self.url, stream=True, verify=False, \
                timeout=10, headers=self.headers)
        except requests.exceptions.InvalidURL:
            return ''
        except requests.exceptions.ReadTimeout :
            print(self.url, "resourse is responding correctly")
            return ''
        except :
            self.res = type('sudo_request',(object,),{
                'url':self.url,
                "headers":{}
            })

        filename = self.get_file_name()
        try : 
            bite_size = int(self.res.headers['Content-Length'])
            with tqdm.tqdm(total=bite_size, disable= not self.render ,unit='b',\
                leave=True, mininterval=0.05, smoothing=0.5) as progress ,\
                open(filename,'wb') as File:
                for chunk in self.res.iter_content(1024) :
                    progress.update(len(chunk))
                    File.write(bytearray(chunk))
        except :
            content = self.res.content
            open(filename,"wb").write(content)
        finally:
            return filename
    
    def get_file_name(self):
        filename = self.out or self.filename_from_headers(self.res).replace('/', '').replace('\\', '')
        name,ext = os.path.splitext(filename)
        if ext == ".javascript":
            ext = '.js'
        filename = "".join([name,ext])
        if self.dir :
            filename = os.path.join(self.dir, filename)
        return self.fix_if_file_exist(filename=filename)

    def filename_from_url(self,url):
        """return: Filename from the url if exist"""
        parse_url = urlparse.urlparse(url)
        fname = os.path.basename(parse_url.path).strip(" \n\t.")
        return requests.utils.unquote(fname).replace(' ','-')  if fname else None \
            or parse_url.netloc.split('.')[-2] + '-' + self.random_filename

    def filename_from_headers(self,reqest):
        """find filename from response header 
        return the filename or random filename with filetype if exist else just filename
        example - (image/jpeg) (application/pdf) (text/javascript (obsolete)) application/something+pdf ; charset=utf-8
        """
        fname = self.filename_from_url(reqest.url)
        content_type = reqest.headers.get("Content-Type")
        if not content_type or os.path.splitext(fname)[-1].startswith('.'): 
            # filetype unknown or full name in the url
            return fname
        elif '/' in content_type :
            # extract the extention for the file
            splited_content_type = content_type.split(';',1)
            if len(splited_content_type) > 1 :
                parameters = { ele[0]: ele[1] \
                    for ele in [par.strip().split('=') \
                        for par in splited_content_type[1].split(';') \
                            if '=' in par]}
                tempname = parameters.get('filename')
                if tempname and os.path.splitext(tempname)[-1].startswith('.'):
                    return tempname

            extention = os.path.basename(splited_content_type[0].strip().split(' ')[0]).split('+')[-1]
            return ".".join([fname, extention])
        else :
            return fname

    def fix_if_file_exist(self, filename):
        """check if file exist true then add random char in name"""
        fname = filename
        if os.path.exists(fname):
            splits_names = fname.rsplit('.',1)
            splits_names[0] += f"-{self.random_filename[:4]}"            
            return ".".join(splits_names)
        else:
            return filename

    @property
    def random_filename(self):
        """return a random name of 8 char long"""
        return "".join([random.choice(string.ascii_lowercase+string.digits) for _ in range(8)])

    def extractData(self,filename):
        """Extract src and href tags form the page for more info"""
        if filename.split('.')[-1] == 'html':
            content = open(filename).read()
            reg = r'(href|src)=\"(.[^"\s]+)"'
            restults = re.findall(reg, content)
            return { resourse[1] if '://' in resourse[1] else \
                f"{self.url.replace(urlparse.urlparse(self.url).path,'')}{resourse[1]}" \
                    for resourse in restults }
        else:
            return {}

    def visit_search(self,function,visited,tovisit,directory):
        """"get page.content and search for the more resourse in the page.content"""
        try :
            with ThreadPoolExecutor() as executor:
                results = executor.map(lambda x: function(*x) , [(i,None,directory,False) for i in tovisit])
                new_routes = { link for new_links in executor.map(self.extractData , [ res for res in results if res]) for link in new_links }
                tovisit ,visited= set(filter(lambda x: x not in visited, new_routes)), set([*tovisit,*visited])
                return visited,tovisit
        except KeyboardInterrupt :
            print('Canceling the layer') 
        except Exception as e:
            print(e)
        finally :
            self.move_files()
            return set(),set()

    def move_files(self):
        filenames = [_file for _file in os.listdir(self.dir) if os.path.isfile(os.path.join(self.dir, _file))]
        for name in filenames:
            _type = os.path.splitext(name)[-1].replace('.', '')
            if _type in self.notToIncludeFiles:
                os.remove(os.path.join(self.dir,name))    
                continue
            type_dir = os.path.join(self.dir,_type)
            new_path = os.path.join(type_dir,name)
            print("File is saved at -->",new_path)
            if not os.path.exists(type_dir):
                os.makedirs(type_dir)
                os.rename(os.path.join(self.dir,name),new_path)
            else:
                if os.path.exists(new_path):
                    new_path = self.fix_if_file_exist(new_path)
                os.rename(os.path.join(self.dir,name),new_path)   

    @classmethod
    def get(cls, url, out=None, directory=None, render=True):
        clas = cls(url=url, out=out, directory=directory, render=render)
        fname = clas.make_request()
        return fname

    @classmethod
    def get_all(cls, url, directory=None, depth = 2,notToIncludeFiles = []) :
        if directory == None:
            directory = urlparse.urlparse(url).netloc.split('.',1)[-1]
        clas = cls(url=url, directory=directory, render=False)
        clas.notToIncludeFiles = notToIncludeFiles
        fname = clas.make_request()
        data = clas.extractData(fname)
        visited,tovisit = clas.visit_search(cls.get, set(), data, directory)
        for i in range(depth):
            if tovisit == set():
                break
            print('\n\tLayer :',i+1)
            print("\tVisited  : ",len(visited))
            print("\tTo Visit : ",len(tovisit),end='\n\n')
            visited, tovisit = clas.visit_search(cls.get, visited, tovisit, directory)
        
        clas.move_files()

# Examples
# downloader.get(url,out=None,render=True)
# downloader.get_all(url,directory=None,depth=1,notToIncludeFiles=['css'])
# python3 file.py -u https://filesamples.com/samples/document/txt/sample1.txt
# python3 file.py -u https://filesamples.com/ -f 0 -o sampleSite/restults.html
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-f','--function' ,type = int, default = 0,help = "Function 0 ==> (Get single page or document)  or 1 ==> (Get the pages recursively) defatul = 0")
    parser.add_argument('-o','--out',default = None ,help = "Name of the output file or Directory")
    parser.add_argument('-u','--url',default = None ,help = "URL to visit")
    parser.add_argument('-d','--depth' ,default = 2, type = int, help = "Depth of the search when going recursively ! (default = 2)")
    parser.add_argument("--noInclude", nargs="+",default = [],help = "file types not to download (default = [] )")
    args = parser.parse_args()
    if args.function in (0,1) and args.url:
        start = perf_counter()
        if args.function:
            downloader.get_all(args.url ,directory=args.out, depth=args.depth ,notToIncludeFiles=args.noInclude)
        else :
            directory = None
            filename = args.out
            if args.out and '/' in args.out:
                filename = os.path.basename(args.out)
                directory = args.out.replace(f'/{filename}','')
            name = downloader.get(args.url ,out=filename,directory= directory ,render=True)
            print("file is saved at :", name)
        print(f"Total time Taken {round(perf_counter() - start,1)} s")
    else : 
        if args.url:
            raise Exception('function should be 0 or 1 important for the program use -h for help')
        raise Exception('URL is important for the program use -h for help')