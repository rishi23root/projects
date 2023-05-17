# webget
webget can be use to download files and can be use to download the whole site data (which is visible to the user) by recursion with the help of use of python3 😎😎😎

## Requirements
  - `pip install tqdm`

## optional arguments:
 - -h, --help            show this help message and exit
 - -f FUNCTION, --function FUNCTION
                        Function 0 ==> (Get single page or document) or 1 ==> (Get the pages recursively) defatul = 0
 - -o OUT, --out OUT     Name of the output file or Directory
 - -u URL, --url URL     URL to visit
 - -d DEPTH, --depth DEPTH
                        Depth of the search when going recursively ! (default = 2)
  --noInclude NOINCLUDE [NOINCLUDE ...]
                        file types not to download (default = [] )

## setup
  - clone the repo `git clone https://github.com/rishabhjainfinal/webget.git `
  - cd webget
  - then run the python program 
  > python3 file.py -u << Your-url >>
  > python3 file.py -u << Your-url >> -f 0 -o sampleSite/restults.html
