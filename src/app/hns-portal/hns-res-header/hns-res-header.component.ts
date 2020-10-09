import { Component, OnInit } from '@angular/core';
import { PropertySecurityGroupService, SharedService, LoaderService } from '../../_services';
import { Subject } from 'rxjs';
import { SubSink } from 'subsink';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-hns-res-header',
  templateUrl: './hns-res-header.component.html',
  styleUrls: ['./hns-res-header.component.css']
})
export class HnsResHeaderComponent implements OnInit {
  subs = new SubSink(); // to unsubscribe services
  printHiearchy: any;
  visitedHierarchy: any[] = [];
  hiearchyTypeLists: any;
  selectedHiearchyType: any;
  hierarchyLevels: any;
  selectedhierarchyLevel: any;
  hiearchyWindow = false;
  assetTerm$ = new Subject<string>();
  addressTerm$ = new Subject<string>();
  // assetFilterId: string;
  // assetFilterAddress: string;
  filterValues: any = {
    hittypecode: '',
    hsownassid: '',
    assId: '',
    addressSearch: '',
    status: 'A'
  }
  pageName = "";
  gridStat: any = "Y";
  hnsPermission: any = [];

  constructor(
    private propSecGrpService: PropertySecurityGroupService,
    private sharedService: SharedService,
    private loaderService: LoaderService,

  ) { }

  ngOnInit() {
    // if (this.router.url == "/health&safety/results/actions") {
    //   this.pageName = "Actions";
    // } else if (this.router.url == "/health&safety/results/information") {
    //   this.pageName = "Information";
    // } else if (this.router.url == "/health&safety/results/summary") {
    //   this.pageName = "Summary";
    // } else if (this.router.url == "/health&safety/results/assessment") {
    //   this.pageName = "Assessment";
    // }

    //empty filter when first time loads
    this.sharedService.changeResultHeaderFilters(this.filterValues);

    this.subs.add(
      this.sharedService.resPageNameObs.subscribe(
        data => {
          this.pageName = data;
        }
      )
    )

    this.subs.add(
      this.assetTerm$
        // .pipe(
        //   debounceTime(10),
        //   distinctUntilChanged()
        // )
        .subscribe((searchTerm) => {
          this.filterValues.assId = searchTerm;
          this.sharedService.changeResultHeaderFilters(this.filterValues);
          //this.filter()
        })
    )

    this.subs.add(
      this.addressTerm$
        // .pipe(
        //   debounceTime(10),
        //   distinctUntilChanged()
        // )
        .subscribe((searchTerm) => {
          this.filterValues.addressSearch = searchTerm;
          this.sharedService.changeResultHeaderFilters(this.filterValues);
          //this.filter()
        })
    )

    this.subs.add(
      this.sharedService.hnsPortalSecurityList.subscribe(
        data => {
          this.hnsPermission = data;
        }
      )
    )

  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getHierarchyTypeList() {
    this.propSecGrpService.getHierarchyTypeList().subscribe(
      data => {
        if (data && data.isSuccess) {
          this.visitedHierarchy = [];
          this.hiearchyTypeLists = data.data;
          if (this.printHiearchy != undefined) {
            this.openHiearchyLiver(this.printHiearchy);
          }
        }
      }
    )
  }

  openHiearchyLiver(data) {
    if (data != undefined) {
      for (let item of data) {
        //$('#' + item.assetId).attr("checked", "checked");
        this.visitedHierarchy[item.assetId] = item.assetId;
        if (item.childLayers != undefined) {
          this.openHiearchyLiver(item.childLayers);
        }
      };
    }
  }


  setHiearchyValues() {
    if (this.selectedHiearchyType && this.selectedhierarchyLevel) {
      this.propSecGrpService.hierarchyStructureForAsset(this.selectedHiearchyType, this.selectedhierarchyLevel.assetId, this.selectedhierarchyLevel.actualParentId).subscribe(
        data => {
          this.loaderService.pageShow();
          this.printHiearchy = data;
          this.filterValues.hittypecode = this.selectedHiearchyType;
          this.filterValues.hsownassid = this.selectedhierarchyLevel.assetId;
          this.filter()
          // this.resetAssetList();
          //this.getAllAssets(this.assetList);
          this.closeHiearchyWindow();
          this.sharedService.changeResultHeaderFilters(this.filterValues);
        }
      )
    }

  }

  public openHiearchyWindow() {
    $('.portalwBlurtab').addClass('ovrlay');
    this.getHierarchyTypeList();
    this.hiearchyWindow = true;
  }

  public closeHiearchyWindow() {
    $('.portalwBlurtab').removeClass('ovrlay');
    this.hiearchyWindow = false;

  }

  getHiearchyTree(hiearchyType = null) {
    if (this.selectedHiearchyType) {
      this.hierarchyLevels = [];
      this.visitedHierarchy = [];
      this.propSecGrpService.getHierarchyAllLevel(this.selectedHiearchyType).subscribe(
        data => {
          this.hierarchyLevels = data;

        }
      )
    }
  }

  selectHiearchy(event: any, hiearchyLevel) {
    this.selectedhierarchyLevel = hiearchyLevel;
    //let path = event.path;
    let ancestorElm = this.findAncestor(event.target, 'tree');
    //console.log(ancestorElm.className);
    this.selectedhierarchyLevel.actualParentId = ancestorElm.className;

  }

  findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.parentElement.classList.contains(cls));
    return el;
  }

  clearPropSec() {
    this.printHiearchy = [];
    this.filterValues.hittypecode = '';
    this.filterValues.hsownassid = '';
    this.sharedService.changeResultHeaderFilters(this.filterValues);
    this.filter()

  }

  clearAssetAndAddress() {
    this.filterValues.assId = '';
    this.filterValues.addressSearch = ''
    this.sharedService.changeResultHeaderFilters(this.filterValues);
    this.filter()
  }

  onChange(event) {
    setTimeout(() => {
      this.sharedService.changeResultHeaderFilters(this.filterValues);
    }, 100);
  }

  onGridStateChange(event) {
    this.gridStat = event;
    let tempObj = {
      LatestAssessment: this.gridStat
    }
    const mergeObj = { ...this.filterValues, ...tempObj };
    setTimeout(() => {
      this.sharedService.changeResultHeaderFilters(mergeObj);
    }, 100);

    // this.headerFilters.LatestAssessment = event;
    // setTimeout(() => {
    //   this.stateChange.next(this.headerFilters);
    // }, 600);

  }

  setAssetId($event) {
    this.assetTerm$.next($event.target.value);
    if ($event.keyCode == 13) {
      this.filter()
    }
  }

  setAddress($event) {
    this.addressTerm$.next($event.target.value);
    if ($event.keyCode == 13) {
      this.filter()
    }
  }

  filter(time = 500) {
    setTimeout(() => {
      this.loaderService.pageHide();
      this.sharedService.changeFilterGrid(true);
    }, time);
  }

}
